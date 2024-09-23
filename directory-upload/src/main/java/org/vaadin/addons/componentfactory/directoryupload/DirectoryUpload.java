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

  public DirectoryUpload(final Receiver receiver) {
    this();
    setReceiver(receiver);
  }

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

}
