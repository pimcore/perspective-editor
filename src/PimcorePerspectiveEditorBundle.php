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

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;
use Pimcore\Extension\Bundle\Traits\PackageVersionTrait;

class PimcorePerspectiveEditorBundle extends AbstractPimcoreBundle
{
    use PackageVersionTrait;

    const PERMISSION_PERSPECTIVE_EDITOR = 'perspective_editor';
    const PERMISSION_PERSPECTIVE_EDITOR_VIEW_EDIT = 'perspective_editor_view_edit';

    /**
     * @return string[]
     */
    public function getJsPaths()
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

    /**
     * @return string[]
     */
    public function getCssPaths()
    {
        return [
            '/bundles/pimcoreperspectiveeditor/css/icons.css'
        ];
    }

    protected function getComposerPackageName(): string
    {
        return 'pimcore/perspective-editor';
    }

    /**
     * @return object|\Pimcore\Extension\Bundle\Installer\InstallerInterface|null
     */
    public function getInstaller()
    {
        return $this->container->get(Installer::class);
    }
}
