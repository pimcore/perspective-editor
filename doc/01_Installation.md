# Installation
## Bundle Installation
You need to follow the steps mentioned above and additionally run the following command:

```bash
composer require pimcore/admin-ui-classic-bundle
```

Installation routine just adds an additional permission to `users_permission_definitions` table. 

Also, make sure, that `customviews.php` and `perspectives.php` files are writeable for php.
They can be located at Pimcore default locations for config files: 
`PIMCORE_CUSTOM_CONFIGURATION_DIRECTORY` or `PIMCORE_CONFIGURATION_DIRECTORY`. 

If they don't exist, they are created at `PIMCORE_CONFIGURATION_DIRECTORY`.
 

## Configuration

To make the bundle work, just make sure, users have the necessary permissions. 
- Perspective Editor: all users with `perspective_editor` permission have all access. 
- Custom Views Editor: all users with `perspective_editor` permission have read access, only admin users
  have write access (due to risk of potential security issues as SQL conditions can be configured in the UI).
  
