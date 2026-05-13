/*
 * Copyright 2024-2026 Vaadin Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
import '@vaadin/upload/src/vaadin-upload-mixin.js';
import '@vaadin/upload/src/vaadin-upload-file-list-mixin.js';
import { Debouncer } from '@vaadin/component-base/src/debounce.js';
import { timeOut } from '@vaadin/component-base/src/async.js';
import { html, render } from 'lit';

(function() {
	window.directoryUploadMixinconnector = {
		initLazy: (customUpload, maxConnections) => {
            // Vaadin 25.1 introduced built-in upload queueing with maxConcurrentUploads.
            // Delegate concurrency control to upstream instead of gating in _uploadFile.
            customUpload.maxConcurrentUploads = maxConnections;

            // Vaadin 25.1 changed the default uploadFormat to 'raw'. Force 'multipart' so
            // Flow's FormData-based receivers (e.g. MultiFileBuffer) keep working.
            customUpload.uploadFormat = 'multipart';

            // Swap the FormData filename for the file's webkitRelativePath so the server
            // receives the directory-relative path. upload-request fires after upstream
            // builds the FormData but before xhr.send, so mutating it here is safe.
            customUpload.addEventListener('upload-request', (e) => {
                const { file, formData } = e.detail;
                if (formData && file.webkitRelativePath) {
                    formData.delete(file.formDataName);
                    formData.append(file.formDataName, file, file.webkitRelativePath);
                }
            });

            var serializableArray;
            customUpload.addEventListener('files-changed', (event) => {
                if (customUpload.noAuto) {
                    const timeout = 500;
                    customUpload._debounceFilesChanged = Debouncer.debounce(customUpload._debounceFilesChanged, timeOut.after(timeout), () => {
                      let newSerializableArray = Array.from(customUpload.files).map(file => {
                        return {
                          name: file.webkitRelativePath,
                          size: file.size,
                          type: file.type,
                          lastModified: file.lastModified
                        };
                      });
                      
                      let sendToServer = false;
                      
                      if (serializableArray==null) {
                        sendToServer = true;
                      } else {
                        if (serializableArray.length !== newSerializableArray.length) {
                            sendToServer = true;
                        } else {
                            const arr1 = Array.from(serializableArray).sort((a, b) => 
                                a.name.localeCompare(b.name) || 
                                a.size - b.size || 
                                a.type.localeCompare(b.type) || 
                                a.lastModified - b.lastModified
                            );
    
                            const arr2 = Array.from(newSerializableArray).sort((a, b) => 
                                a.name.localeCompare(b.name) || 
                                a.size - b.size || 
                                a.type.localeCompare(b.type) || 
                                a.lastModified - b.lastModified
                            );
    
                            for (let i = 0; i < arr1.length; i++) {
                                if (
                                    arr1[i].name !== arr2[i].name ||
                                    arr1[i].size !== arr2[i].size ||
                                    arr1[i].type !== arr2[i].type ||
                                    arr1[i].lastModified !== arr2[i].lastModified
                                ) {
                                    sendToServer = true;
                                }
                            }
                        }
                      }
                      
                      if (sendToServer) {
                          serializableArray = newSerializableArray;
                          customUpload.$server.setFilesToBeUploaded(serializableArray);
                      }
                    });
                }
            });

			function transverseDirectory(item) {
							if (item.isFile) {
								item.file((file) => {
									Object.defineProperty(file, 'webkitRelativePath', {
									      value: item.fullPath.charAt(0) == "/" ? item.fullPath.substring(1, item.fullPath.length) : item.fullPath
									    });
									customUpload._addFile(file);
									});
							}
							if (item.isDirectory) {
								item.createReader().readEntries((entries) => {
								      entries.forEach((entry) => {
										transverseDirectory(entry);
									});
								});
							}
						};
						
		
			// Overriding onDrop to obtain file objects with full path information
			customUpload._onDrop = (event) => {
				if (!customUpload.nodrop) {
					event.preventDefault();
					event.stopPropagation();
					customUpload._dragover = customUpload._dragoverValid = false;
					var items = event.dataTransfer.items;
					for (let i = 0; i < items.length; i++) {
					      let item = items[i].webkitGetAsEntry();
					      if (item) {
					        transverseDirectory(item);
					      }
					    }
				}
			}
			customUpload.shadowRoot.querySelector('input').setAttribute("webkitDirectory", "");
			customUpload.addEventListener('drop', customUpload._onDrop.bind(customUpload), true);
			
			var uploadList = customUpload.querySelector('vaadin-upload-file-list');

			uploadList.requestContentUpdate = () => {
			      const { items, i18n } = uploadList;
                  items.sort(function(a,b) {
                      return (a.webkitRelativePath + a.name).localeCompare(b.webkitRelativePath + b.name);
                  });
			      render(
			        html`
			          ${items.sort().map(
			            (file) => html`
			              <li>
			                <vaadin-upload-file
			                  .file="${file}"
			                  .complete="${file.complete}"
			                  .errorMessage="${file.error}"
			                  .fileName="${file.webkitRelativePath}"
			                  .held="${file.held}"
			                  .indeterminate="${file.indeterminate}"
			                  .progress="${file.progress}"
			                  .status="${file.status}"
			                  .uploading="${file.uploading}"
			                  .i18n="${i18n}"
			                ></vaadin-upload-file>
			              </li>
			            `,
			          )}
			        `,
			        uploadList,
			      );
			    }
			
		}
	}
})();
