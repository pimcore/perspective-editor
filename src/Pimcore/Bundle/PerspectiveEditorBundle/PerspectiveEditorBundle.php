<?php

namespace Pimcore\Bundle\PerspectiveEditorBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class PerspectiveEditorBundle extends AbstractPimcoreBundle
{
    public function getJsPaths()
    {
        return [
            '/bundles/admin/js/pimcore/perspective/startup.js',
            '/bundles/admin/js/pimcore/perspective/perspective.js',
            '/bundles/admin/js/pimcore/perspective/view.js',
            '/bundles/admin/js/pimcore/perspective/common.js',
        ];
    }
}
