/*
 * Copyright 2024 Vaadin Ltd.
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
			const MAX_CONNECTIONS = maxConnections;
            customUpload.queueNext = () => {
                const numConnections = customUpload.files.filter(file => file.uploading).length;
                if(numConnections < MAX_CONNECTIONS) {
                // reverse to pick next in selection order
                    const nextFileToUpload = customUpload.files.slice().reverse().find(file => file.held)
                    if (nextFileToUpload) {
                        customUpload.uploadFiles(nextFileToUpload)
                    }
                }
            }
            
            // start uploading next file in queue when a file is successfully uploaded
            customUpload.addEventListener('upload-success', e => {
                customUpload.queueNext();
            });
            
            // start uploading next file in queue also when there is an error when uploading the file
            customUpload.addEventListener('upload-error', () => {
                customUpload.queueNext();
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
            
			// Override _uploadFile to handle passing of full path from webkitRelativePath
			customUpload._uploadFile = (file) => {
                
                const numConnections = customUpload.files.filter(file => file.uploading).length;
                if(numConnections >= MAX_CONNECTIONS) {
                    return;
                }
                
				if (file.uploading) {
					return;
				}

				const ini = Date.now();
				const xhr = (file.xhr = customUpload._createXhr());

				let stalledId, last;
				// Onprogress is called always after onreadystatechange
				xhr.upload.onprogress = (e) => {
					clearTimeout(stalledId);

					last = Date.now();
					const elapsed = (last - ini) / 1000;
					const loaded = e.loaded,
						total = e.total,
						progress = ~~((loaded / total) * 100);
					file.loaded = loaded;
					file.progress = progress;
					file.indeterminate = loaded <= 0 || loaded >= total;

					if (file.error) {
						file.indeterminate = file.status = undefined;
					} else if (!file.abort) {
						if (progress < 100) {
							customUpload._setStatus(file, total, loaded, elapsed);
							stalledId = setTimeout(() => {
								file.status = customUpload.i18n.uploading.status.stalled;
								customUpload._renderFileList();
							}, 2000);
						} else {
							file.loadedStr = file.totalStr;
							file.status = customUpload.i18n.uploading.status.processing;
						}
					}

					customUpload._renderFileList();
					customUpload.dispatchEvent(new CustomEvent('upload-progress', { detail: { file, xhr } }));
				};

				// More reliable than xhr.onload
				xhr.onreadystatechange = () => {
					if (xhr.readyState === 4) {
						clearTimeout(stalledId);
						file.indeterminate = file.uploading = false;
						if (file.abort) {
							return;
						}
						file.status = '';
						// Custom listener can modify the default behavior either
						// preventing default, changing the xhr, or setting the file error
						const evt = customUpload.dispatchEvent(
							new CustomEvent('upload-response', {
								detail: { file, xhr },
								cancelable: true,
							}),
						);

						if (!evt) {
							return;
						}
						if (xhr.status === 0) {
							file.error = customUpload.i18n.uploading.error.serverUnavailable;
						} else if (xhr.status >= 500) {
							file.error = customUpload.i18n.uploading.error.unexpectedServerError;
						} else if (xhr.status >= 400) {
							file.error = customUpload.i18n.uploading.error.forbidden;
						}

						file.complete = !file.error;
						customUpload.dispatchEvent(
							new CustomEvent(`upload-${file.error ? 'error' : 'success'}`, {
								detail: { file, xhr },
							}),
						);
						customUpload._renderFileList();
					}
				};

				const formData = new FormData();

				if (!file.uploadTarget) {
					file.uploadTarget = customUpload.target || '';
				}
				file.formDataName = customUpload.formDataName;

				const evt = customUpload.dispatchEvent(
					new CustomEvent('upload-before', {
						detail: { file, xhr },
						cancelable: true,
					}),
				);
				if (!evt) {
					return;
				}
				formData.append(file.formDataName, file, file.webkitRelativePath);

				xhr.open(customUpload.method, file.uploadTarget, true);
				customUpload._configureXhr(xhr);

				file.status = customUpload.i18n.uploading.status.connecting;
				file.uploading = file.indeterminate = true;
				file.complete = file.abort = file.error = file.held = false;

				xhr.upload.onloadstart = () => {
					customUpload.dispatchEvent(
						new CustomEvent('upload-start', {
							detail: { file, xhr },
						}),
					);
					customUpload._renderFileList();
				};

				// Custom listener could modify the xhr just before sending it
				// preventing default
				const uploadEvt = customUpload.dispatchEvent(
					new CustomEvent('upload-request', {
						detail: { file, xhr, formData },
						cancelable: true,
					}),
				);
				if (uploadEvt) {
					xhr.send(formData);
				}
			}
			
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
