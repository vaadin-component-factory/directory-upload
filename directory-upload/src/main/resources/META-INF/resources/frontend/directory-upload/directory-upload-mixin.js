import '@vaadin/upload/src/vaadin-upload-mixin.js';
import '@vaadin/upload/src/vaadin-upload-file-list-mixin.js';
import { html, render } from 'lit';

(function() {
	window.directoryUploadMixinconnector = {
		initLazy: (customUpload) => {
			
			// Override _uploadFile to handle passing of full path from webkitRelativePath
			customUpload._uploadFile = (file) => {
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

			      render(
			        html`
			          ${items.map(
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
