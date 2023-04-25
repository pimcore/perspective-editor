<?php

if(\Pimcore\Version::getMajorVersion() >= 11) {
    return [
        \Pimcore\Bundle\AdminBundle\PimcoreAdminBundle::class => ['all' => true],
        \Pimcore\Bundle\PerspectiveEditorBundle\PimcorePerspectiveEditorBundle::class => ['all' => true]
    ];
}

return [
    \Pimcore\Bundle\PerspectiveEditor\PimcorePerspectiveEditorBundle::class => ['all' => true]
];
