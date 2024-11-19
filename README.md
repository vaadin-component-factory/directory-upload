# Directory Upload Addon for Vaadin Flow

This project is a Upload extension that handles uploading of directories, by using the file explorer selection window or drag and drop.

This component is part of Vaadin Component Factory

## Features

* Supports uploading directories by selecting or dragging and dropping them
* Concurrent maximum connection control
* Start and Retry buttons visibility control
* Server side custom pre-validation definition support 

## Running the component demo
Run from the command line:
- `mvn  -pl directory-upload-demo -Pwar install jetty:run`

Then navigate to `http://localhost:8080/`

## Installing the component
Run from the command line:
- `mvn clean install -DskipTests`

## Profiles
### Profile "directory"
This profile, when enabled, will create the zip file for uploading to Vaadin's directory

### Profile "production"
This profile, when enabled, will execute a production build for the demo

## Using the component in a Flow application
To use the component in an application using maven,
add the following dependency to your `pom.xml`:
```
<dependency>
    <groupId>org.vaadin.addons.componentfactory</groupId>
    <artifactId>directory-upload</artifactId>
    <version>${component.version}</version>
</dependency>
```

## How to Use
The following example shows how to implement all the features offered by the component:

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

## Flow documentation
Documentation for flow can be found in [Flow documentation](https://vaadin.com/docs/latest/flow/).

## License

Apache Licence 2