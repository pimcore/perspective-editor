<?php

/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Commercial License (PCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 *  @license    http://www.pimcore.org/license     GPLv3 and PCL
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
    public function install()
    {
        Definition::create(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR);
        Definition::create(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR_VIEW_EDIT);

        parent::install();

        return true;
    }

    public function getLastMigrationVersionClassName(): ?string
    {
        return Version20211213110000::class;
    }
}
