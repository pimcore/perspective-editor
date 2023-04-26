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

use Pimcore\Bundle\AdminBundle\PimcoreAdminBundle;
use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\Installer\InstallerInterface;
use Pimcore\Extension\Bundle\PimcoreBundleAdminClassicInterface;
use Pimcore\Extension\Bundle\Traits\BundleAdminClassicTrait;
use Pimcore\Extension\Bundle\Traits\PackageVersionTrait;
use Pimcore\HttpKernel\Bundle\DependentBundleInterface;
use Pimcore\HttpKernel\BundleCollection\BundleCollection;

class PimcorePerspectiveEditorBundle extends AbstractPimcoreBundle implements PimcoreBundleAdminClassicInterface, DependentBundleInterface
{
    use BundleAdminClassicTrait;
    use PackageVersionTrait;

    const PERMISSION_PERSPECTIVE_EDITOR = 'perspective_editor';
    const PERMISSION_PERSPECTIVE_EDITOR_VIEW_EDIT = 'perspective_editor_view_edit';


    public static function registerDependentBundles(BundleCollection $collection): void
    {
        $collection->addBundle(new PimcoreAdminBundle(), 60);
    }

    public function getJsPaths(): array
    {
        return [
            '/bundles/pimcoreperspectiveeditor/js/pimcore/perspective/menuItemPermissionHelper.js',
            '/bundles/pimcoreperspectiveeditor/js/pimcore/perspective/perspective.js',
            '/bundles/pimcoreperspectiveeditor/js/pimcore/perspective/view.js',
            '/bundles/pimcoreperspectiveeditor/js/pimcore/perspective/common.js',
            '/bundles/pimcoreperspectiveeditor/js/pimcore/perspective/startup.js',
            '/bundles/pimcoreperspectiveeditor/js/pimcore/perspective/events.js',
        ];
    }

    public function getCssPaths(): array
    {
        return [
            '/bundles/pimcoreperspectiveeditor/css/icons.css'
        ];
    }

    protected function getComposerPackageName(): string
    {
        return 'pimcore/perspective-editor';
    }

    public function getInstaller(): InstallerInterface
    {
        return $this->container->get(Installer::class);
    }
}
