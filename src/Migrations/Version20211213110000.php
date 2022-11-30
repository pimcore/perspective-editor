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

namespace Pimcore\Bundle\PerspectiveEditorBundle\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Pimcore\Bundle\PerspectiveEditorBundle\PimcorePerspectiveEditorBundle;
use Pimcore\Migrations\BundleAwareMigration;
use Pimcore\Model\Tool\SettingsStore;

class Version20211213110000 extends BundleAwareMigration
{
    protected function getBundleName(): string
    {
        return 'PimcorePerspectiveEditorBundle';
    }

    protected function checkBundleInstalled(): bool
    {
        //need to always return true here, as the migration is setting the bundle installed
        return true;
    }

    public function up(Schema $schema): void
    {
        SettingsStore::set('BUNDLE_INSTALLED__Pimcore\\Bundle\\PerspectiveEditorBundle\\PimcorePerspectiveEditorBundle', true, 'bool', 'pimcore');

        $this->addSql(sprintf("INSERT IGNORE INTO users_permission_definitions (`key`) VALUES('%s');", PimcorePerspectiveEditorBundle::PERMISSION_PERSPECTIVE_EDITOR_VIEW_EDIT));
    }

    public function down(Schema $schema): void
    {
    }
}
