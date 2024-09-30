/*
 * Copyright 2000-2024 Vaadin Ltd.
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
package org.vaadin.addons.componentfactory.directoryupload;

import com.vaadin.flow.component.AttachEvent;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.upload.MultiFileReceiver;
import com.vaadin.flow.component.upload.Receiver;
import com.vaadin.flow.component.upload.Upload;

@JsModule("./directory-upload/directory-upload-mixin.js")
public class DirectoryUpload extends Upload {

  public DirectoryUpload() {
  }

  /**
   * Expects a MultiFileReceiver, otherwise it will throw {@link UnsupportedOperationException}
   */
  public DirectoryUpload(final Receiver receiver) {
    this();
    setReceiver(receiver);
  }

  /**
   * Expects a MultiFileReceiver, otherwise it will throw {@link UnsupportedOperationException}
   */
  @Override
  public void setReceiver(final Receiver receiver) {
    if (!(receiver instanceof MultiFileReceiver)) {
      throw new UnsupportedOperationException("Please use a MultiFileReceiver");
    }
    super.setReceiver(receiver);
  }

  @Override
  protected void onAttach(final AttachEvent attachEvent) {
    super.onAttach(attachEvent);
    this.getElement().executeJs("directoryUploadMixinconnector.initLazy($0)", this.getElement());
  }

  /**
   * Trigger uploading all pending files
   */
  public void uploadPendingFiles() {
    this.getElement().executeJs("this.uploadFiles()");
  }

}
