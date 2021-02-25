# Installation

The installation of this bundle follows Pimcore standards. To install use following commands: 

```bash
composer require pimcore/perspective-editor
./bin/console pimcore:bundle:enable PimcorePerspectiveEditorBundle
./bin/console pimcore:bundle:install PimcorePerspectiveEditorBundle
```

Installation routine just adds an additional permission to `users_permission_definitions` table. 

Also, make sure, that `customvies.php` and `perspectives.php` files are writeable for php.
They can be located at Pimcore default locations for config files: 
`PIMCORE_CUSTOM_CONFIGURATION_DIRECTORY` or `PIMCORE_CONFIGURATION_DIRECTORY`. 

If they don't exist, they are created at `PIMCORE_CONFIGURATION_DIRECTORY`.
 


## Configuration

To make the bundle work, just make sure, users have the necessary permissions. 
- Perspective Editor: all users with `perspective_editor` permission have all access. 
- Custom Views Editor: all users with `perspective_editor` permission have read access, only admin users
  have write access (due to risk of potential security issues as SQL conditions can be configured in the UI).
  