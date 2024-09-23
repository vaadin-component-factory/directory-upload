/*
 * Copyright 2000-2017 Vaadin Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package org.vaadin.addons.componentfactory.demo;

import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.upload.receivers.MultiFileBuffer;
import com.vaadin.flow.component.upload.receivers.TemporaryFileFactory;
import com.vaadin.flow.demo.DemoView;
import com.vaadin.flow.router.Route;
import org.vaadin.addons.componentfactory.directoryupload.DirectoryUpload;

/**
 * View for {@link PaperInput} demo.
 *
 * @author Vaadin Ltd
 */
@SuppressWarnings("serial")
@Route("")
public class DirectoryUploadDemoView extends DemoView {

    @Override
    public void initView() {
      createBasicDirectoryUploadDemo();

    }

    private void createBasicDirectoryUploadDemo() {
      final Div message = createMessageDiv("directory-upload-demo-message");

        // begin-source-example
        // source-example-heading: Simple paper input
      final DirectoryUpload upload = new DirectoryUpload(new MultiFileBuffer(e -> {
        add(new Span(e));
        return new TemporaryFileFactory().createFile(e);
      }));
        // end-source-example


      addCard("Directory upload", upload, message);
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
