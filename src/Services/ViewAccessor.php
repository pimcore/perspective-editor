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

namespace Pimcore\Bundle\PerspectiveEditorBundle\Services;

class ViewAccessor extends AbstractAccessor
{
    protected $filename = 'customviews.php';

    public function getAvailableViews()
    {
        $configuration = $this->getConfiguration();
        $availableViews = [];

        if ($configuration) {
            foreach ($configuration['views'] as $view) {
                $availableViews[] = ['id' => $view['id'], 'name' => $view['name'] . ' (Type: '. $view['treetype'] .', Root: '. $view['rootfolder'] .')'];
            }
        }

        return $availableViews;
    }

    protected function convertTreeStoreToConfiguration($treeStore)
    {
        $configuration = [];
        foreach ($treeStore['children'] as $child) {
            if (!empty($child['config']['treeContextMenu'])) {
                foreach (array_keys($child['config']['treeContextMenu']) as $contextMenuEntry) {
                    if (substr($child['config']['treetype'], 0, strlen($contextMenuEntry)) != $contextMenuEntry) {
                        unset($child['config']['treeContextMenu'][$contextMenuEntry]);
                    }
                }
            }
            $configuration[$child['id']] = $child['config'];
        }

        return $configuration;
    }

    public function getConfiguration(): array
    {
        $views = \Pimcore\CustomView\Config::get();
        if ($views) {
            return ['views' => $views];
        }

        return [];
    }

    public function writeConfiguration($treeStore, ?array $deletedRecords)
    {
        $configuration = $this->convertTreeStoreToConfiguration($treeStore);
        \Pimcore\CustomView\Config::save($configuration, $deletedRecords);
    }
}
