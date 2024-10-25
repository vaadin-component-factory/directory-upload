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
package org.vaadin.addons.componentfactory.demo;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.upload.receivers.MultiFileBuffer;
import com.vaadin.flow.component.upload.receivers.TemporaryFileFactory;
import com.vaadin.flow.demo.DemoView;
import com.vaadin.flow.router.Route;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.vaadin.addons.componentfactory.directoryupload.DirectoryUpload;
import org.vaadin.addons.componentfactory.directoryupload.File;

/**
 * View for {@link DirectoryUpload} demo.
 *
 * @author Vaadin Ltd
 */
@SuppressWarnings("serial")
@Route("")
public class DirectoryUploadDemoView extends DemoView {

  private static Logger logger = LoggerFactory.getLogger(DirectoryUploadDemoView.class);

    @Override
    public void initView() {
      createBasicDirectoryUploadDemo();

    }

    private void createBasicDirectoryUploadDemo() {
      final Div message = createMessageDiv("directory-upload-demo-message");

        // begin-source-example
        // source-example-heading: Simple directory upload
      final DirectoryUpload upload = new DirectoryUpload(new MultiFileBuffer(e -> {
        logger.info("File received with path: " + e);
        return new TemporaryFileFactory().createFile(e);
      }));
      upload.setAutoUpload(false);
      upload.setPlayButtonVisible(false);
      upload.setRetryButtonVisible(false);
      upload.addFilesSelectedListener(event -> {
        List<File> files = event.getFiles();
        files.forEach(file -> {
          if (file.getName().contains("!")) {
            upload.markFileWithError(file, "contains illegal characters");
          }
        });
      });
        // end-source-example

        addCard("Simple directory upload", upload, message,
          new Button("Trigger upload", e -> upload.uploadPendingFiles()));
    }


    // begin-source-example
    // source-example-heading: Additional code used in the demo

    private Div createMessageDiv(final String id) {
        final Div message = new Div();
        message.setId(id);
        message.getStyle().set("whiteSpace", "pre");
        return message;
    }
    // end-source-example
}
