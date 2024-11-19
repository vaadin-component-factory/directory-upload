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
import com.vaadin.flow.component.ClientCallable;
import com.vaadin.flow.component.ComponentEventListener;
import com.vaadin.flow.component.dependency.CssImport;
import com.vaadin.flow.component.dependency.JsModule;
import com.vaadin.flow.component.upload.MultiFileReceiver;
import com.vaadin.flow.component.upload.Receiver;
import com.vaadin.flow.component.upload.Upload;
import com.vaadin.flow.shared.Registration;
import elemental.json.JsonArray;
import elemental.json.JsonObject;
import elemental.json.JsonValue;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("serial")
@JsModule("./directory-upload/directory-upload-mixin.js")
@CssImport("./directory-upload/styles/styles.css")
public class DirectoryUpload extends Upload {

  private int maxConnections = 1;
  private final List<ComponentEventListener<FilesSelectedEvent>> filesSelectedListeners = new ArrayList<>();

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
   * Configures the start button for the files to be uploaded visibility
   * 
   * @param startButtonVisible true (default) to make the start button visible, false otherwise
   */
  public void setStartButtonVisible(final boolean startButtonVisible) {
    if (startButtonVisible) {
      this.removeClassName("hide-start-button");
    } else {
      this.addClassName("hide-start-button");
    }
  }

  /**
   * Returns the start button for the files to be uploaded visibility
   * 
   * @return true if the start button is visible, false otherwise
   */
  public boolean isStartButtonVisible() {
    return !this.hasClassName("hide-start-button");
  }
  
  
  /**
   * Configures the Retry button for the files to be uploaded visibility
   * 
   * @param retryButtonVisible true (default) to make the retry button visible, false otherwise
   */
  public void setRetryButtonVisible(final boolean retryButtonVisible) {
    if (retryButtonVisible) {
      this.removeClassName("hide-retry-button");
    } else {
      this.addClassName("hide-retry-button");
    }
  }

  /**
   * Returns the Retry button for the files to be uploaded visibility
   * 
   * @return true if the Retry button is visible, false otherwise
   */
  public boolean isRetryButtonVisible() {
    return !this.hasClassName("hide-retry-button");
  }
  
  /**
   * Informs a set of files selected to be uploaded
   * 
   * @param filesJsonValue
   */
  @ClientCallable
  public void setFilesToBeUploaded(JsonValue filesJsonValue) {
    List<File> files = parseJsonToFileList(filesJsonValue);

    fireFilesSelectedEvent(files);
  }
  
  /**
   * Marks a given file with a validation error
   * 
   * @param file
   * @param error
   */
  public void markFileWithError(File file, String error) {
    getElement().executeJs("""
        requestAnimationFrame(function(){
          const file = Array.from(this.files).find(file => file.webkitRelativePath === $1);
          file.error=$0;
          this.files=Array.from(this.files);
      }.bind(this))""", error, file.getName());
  }
  
  private void fireFilesSelectedEvent(List<File> files) {
      FilesSelectedEvent event = new FilesSelectedEvent(this, files);
      for (ComponentEventListener<FilesSelectedEvent> listener : filesSelectedListeners) {
          listener.onComponentEvent(event);
      }
  }
  
  private List<File> parseJsonToFileList(JsonValue jsonValue) {
    List<File> files = new ArrayList<>();
    if (jsonValue instanceof JsonArray) {
        JsonArray jsonArray = (JsonArray) jsonValue;
        for (int i = 0; i < jsonArray.length(); i++) {
            JsonObject jsonObject = jsonArray.getObject(i);
            String name = jsonObject.getString("name");
            long size = (long) jsonObject.getNumber("size");
            String type = jsonObject.getString("type");
            long lastModified = (long) jsonObject.getNumber("lastModified");

            File file = new File(name, size, type, lastModified);
            files.add(file);
        }
    }
    return files;
  }
  
  public Registration addFilesSelectedListener(ComponentEventListener<FilesSelectedEvent> listener) {
      filesSelectedListeners.add(listener);
      return () -> filesSelectedListeners.remove(listener);
  }
  
}
