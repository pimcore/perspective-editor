# Export / Import

The perspective editor allows you to export and import perspectives and custom views. This is
useful to migrate the configuration from one Pimcore installation to another, or to back up your
setup.

Both the *Perspective Editor* and the *View Editor* tab provide **Export** and **Import** buttons in
the toolbar above the tree.

## Export

Clicking **Export** downloads the current configuration as a JSON file
(`perspectives.json` or `customviews.json`). The exported file reflects the configuration that is
currently loaded in the editor.

> Note: Export reflects the state currently shown in the editor. If you have unsaved changes, they
> are included in the export.

## Import

Clicking **Import** opens a file picker. After selecting a previously exported JSON file, the
contained perspectives or views are appended to the current tree:

- New identifiers are generated for the imported entries so they never collide with existing ones.
- Imported perspectives whose name already exists are automatically suffixed to keep names unique.
- Imported entries are always marked as writeable.

The imported entries are **not** persisted automatically. Review them and click **Save** to apply
the changes. The regular server side validation is applied on save, so an invalid import is
rejected just like a manual change.
