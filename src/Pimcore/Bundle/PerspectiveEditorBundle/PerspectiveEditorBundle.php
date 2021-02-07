<?php

namespace PerspectiveEditorBundle;

use Pimcore\Extension\Bundle\AbstractPimcoreBundle;

class PerspectiveEditorBundle extends AbstractPimcoreBundle
{
    public function getJsPaths()
    {
        return [
            '/bundles/perspectiveeditor/js/pimcore/perspective/startup.js',
            '/bundles/perspectiveeditor/js/pimcore/perspective/perspective.js',
            '/bundles/perspectiveeditor/js/pimcore/perspective/view.js',
            '/bundles/perspectiveeditor/js/pimcore/perspective/common.js',
        ];
    }
}
