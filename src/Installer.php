<?php

/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Enterprise License (PEL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (http://www.pimcore.org)
 *  @license    http://www.pimcore.org/license     GPLv3 and PEL
 */

namespace Pimcore\Bundle\PerspectiveEditorBundle;

use Pimcore\Db;
use Pimcore\Extension\Bundle\Installer\AbstractInstaller;
use Pimcore\Model\User\Permission\Definition;

class Installer extends AbstractInstaller
{
    public function needsReloadAfterInstall(): bool
    {
        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function canBeInstalled(): bool
    {
        return !$this->isInstalled();
    }

    /**
     * {@inheritdoc}
     */
    public function isInstalled(): bool
    {
        $db = Db::get();
        $check = $db->fetchOne('SELECT `key` FROM users_permission_definitions where `key` = ?', [PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR]);

        return (bool)$check;
    }

    /**
     * {@inheritdoc}
     */
    public function install()
    {
        Definition::create(PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR);

        return true;
    }
}
