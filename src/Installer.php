<?php

/**
 * This source file is available under the terms of the
 * Pimcore Open Core License (POCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (https://www.pimcore.com)
 *  @license    Pimcore Open Core License (POCL)
 */

namespace Pimcore\Bundle\PerspectiveEditorBundle;

use Pimcore\Bundle\PerspectiveEditorBundle\Migrations\Version20211213110000;
use Pimcore\Extension\Bundle\Installer\SettingsStoreAwareInstaller;
use Pimcore\Model\User\Permission\Definition;

class Installer extends SettingsStoreAwareInstaller
{
    public function needsReloadAfterInstall(): bool
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function install(): void
    {
        Definition::create(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR);
        Definition::create(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR_VIEW_EDIT);

        parent::install();
    }

    public function getLastMigrationVersionClassName(): ?string
    {
        return Version20211213110000::class;
    }
}
