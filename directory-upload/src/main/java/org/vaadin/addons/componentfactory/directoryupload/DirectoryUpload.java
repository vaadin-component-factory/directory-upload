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
import com.vaadin.flow.component.dependency.CssImport;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.upload.MultiFileReceiver;
import com.vaadin.flow.component.upload.Receiver;
import com.vaadin.flow.component.upload.Upload;

@JsModule("./directory-upload/directory-upload-mixin.js")
@CssImport("./directory-upload/styles/styles.css")
public class DirectoryUpload extends Upload {

  private int maxConnections = 1;

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
    this.getElement().executeJs("directoryUploadMixinconnector.initLazy($0, $1)", this.getElement(),
        maxConnections);
  }

  /**
   * Trigger uploading all pending files
   */
  public void uploadPendingFiles() {
    this.getElement().executeJs("this.uploadFiles()");
  }

  /**
   * Number of simultaneous connections when uploading, defaults to 1
   *
   * @param maxConnections
   */
  public void setMaxConnections(final int maxConnections) {
    this.maxConnections = maxConnections;
  }

  public int getMaxConnections() {
    return maxConnections;
  }
  
  /**
   * Configures the play button for the files to be uploaded visibility
   * 
   * @param playButtonVisible true (default) to make the play button visible, false otherwise
   */
  public void setPlayButtonVisible(final boolean playButtonVisible) {
    if (playButtonVisible) {
      this.removeClassName("hide-play-button");
    } else {
      this.addClassName("hide-play-button");
    }
  }

  /**
   * Returns the play button for the files to be uploaded visibility
   * 
   * @return true if the play button is visible, false otherwise
   */
  public boolean isPlayButtonVisible() {
    return !this.hasClassName("hide-play-button");
  }

}
