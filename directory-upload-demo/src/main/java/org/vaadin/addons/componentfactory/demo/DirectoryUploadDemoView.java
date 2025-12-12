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
package org.vaadin.addons.componentfactory.demo;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dependency.StyleSheet;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.upload.receivers.MultiFileBuffer;
import com.vaadin.flow.component.upload.receivers.TemporaryFileFactory;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.theme.lumo.Lumo;
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
@Route("")
@StyleSheet(Lumo.STYLESHEET)
public class DirectoryUploadDemoView extends VerticalLayout {

  private static Logger logger = LoggerFactory.getLogger(DirectoryUploadDemoView.class);

  public DirectoryUploadDemoView() {
    createBasicDirectoryUploadDemo();
  }

  private void createBasicDirectoryUploadDemo() {

    final DirectoryUpload upload = new DirectoryUpload(new MultiFileBuffer(e -> {
      logger.info("File received with path: " + e);
      return new TemporaryFileFactory().createFile(e);
    }));
    upload.setAutoUpload(false);
    upload.setStartButtonVisible(false);
    upload.setRetryButtonVisible(false);
    upload.setMaxConnections(2);
    upload.addFilesSelectedListener(event -> {
      List<File> files = event.getFiles();
      files.forEach(file -> {
        if (file.getName().contains("400")) {
          upload.markFileWithError(file, "contains illegal characters<br/>asdfasd ");
        }
      });
    });

    VerticalLayout demoContainer = new VerticalLayout();
    demoContainer.add(new H3("Simple directory upload"), upload,
        new Button("Trigger upload", e -> upload.uploadPendingFiles()));
    demoContainer.setSpacing(true);
    demoContainer.setPadding(true);

    add(demoContainer);
  }

}
