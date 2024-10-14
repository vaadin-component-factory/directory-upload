package org.vaadin.addons.componentfactory.directoryupload;

import com.vaadin.flow.component.Component;
import com.vaadin.flow.component.ComponentEvent;
import java.util.List;

/**
 * Class that represents the event that is fired when a set of Files is selected to be uploaded
 */
@SuppressWarnings("serial")
public class FilesSelectedEvent extends ComponentEvent<Component> {

    private final List<File> files;

    public FilesSelectedEvent(Component source, List<File> files) {
        super(source, false);
        this.files = files;
    }

    public List<File> getFiles() {
        return files;
    }
}
