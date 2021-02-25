<?php

namespace Pimcore\Bundle\PerspectiveEditorBundle;

use Pimcore\Bundle\DataHubBundle\Controller\ConfigController;
use Pimcore\Db;
use Pimcore\Extension\Bundle\Installer\AbstractInstaller;
use Pimcore\Logger;
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
        $check = $db->fetchOne("SELECT `key` FROM users_permission_definitions where `key` = ?", [PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR]);

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
