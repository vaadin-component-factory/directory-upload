package org.vaadin.addons.componentfactory.directoryupload;

/**
 * Class representing a file that could be uploaded
 */
public class File {
  private String name;
  private long size;
  private String type;
  private long lastModified;

  public File(String name, long size, String type, long lastModified) {
      this.name = name;
      this.size = size;
      this.type = type;
      this.lastModified = lastModified;
  }

  public String getName() {
      return name;
  }

  public void setName(String name) {
      this.name = name;
  }

  public long getSize() {
      return size;
  }

  public void setSize(long size) {
      this.size = size;
  }

  public String getType() {
      return type;
  }

  public void setType(String type) {
      this.type = type;
  }

  public long getLastModified() {
      return lastModified;
  }

  public void setLastModified(long lastModified) {
      this.lastModified = lastModified;
  }

  @Override
  public String toString() {
      return "File{" +
              "name='" + name + '\'' +
              ", size=" + size +
              ", type='" + type + '\'' +
              ", lastModified=" + lastModified +
              '}';
  }
}
