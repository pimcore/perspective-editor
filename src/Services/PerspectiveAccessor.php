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

namespace Pimcore\Bundle\PerspectiveEditorBundle\Services;

class PerspectiveAccessor extends AbstractAccessor
{
    protected $filename = 'perspectives.php';

    public function createFile()
    {
        $defaultConfig =
            [
                'default' => [
                'iconCls' => 'pimcore_icon_perspective',
                'elementTree' => [
                    [
                        'type' => 'documents',
                        'position' => 'left',
                        'expanded' => false,
                        'hidden' => false,
                        'sort' => -3
                    ],
                    [
                        'type' => 'assets',
                        'position' => 'left',
                        'expanded' => false,
                        'hidden' => false,
                        'sort' => -2
                    ],
                    [
                        'type' => 'objects',
                        'position' => 'left',
                        'expanded' => false,
                        'hidden' => false,
                        'sort' => -1
                    ]

                ],
                'dashboards' => [
                    'predefined' => [
                        'welcome' => [
                            'positions' => [
                                [
                                    [
                                        'id' => 1,
                                        'type' => 'pimcore.layout.portlets.modificationStatistic',
                                        'config' => null
                                    ],
                                    [
                                        'id' => 2,
                                        'type' => 'pimcore.layout.portlets.modifiedAssets',
                                        'config' => null
                                    ]
                                ],
                                [
                                    [
                                        'id' => 3,
                                        'type' => 'pimcore.layout.portlets.modifiedObjects',
                                        'config' => null
                                    ],
                                    [
                                        'id' => 4,
                                        'type' => 'pimcore.layout.portlets.modifiedDocuments',
                                        'config' => null
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ];

        $str = "<?php\n return " . $this->pretty_export($defaultConfig) . ';';
        file_put_contents($this->configDirectory.$this->filename, $str);
    }

    protected function convertTreeStoreToConfiguration($treeStore)
    {
        $configuration = [];

        foreach ($treeStore['children'] as $child) {
            $name = $child['name'];
            $configuration[$name] = [];
            $configuration[$name]['elementTree'] = [];
            foreach ($child['children'] as $index => $element) {
                if ($element['type'] == 'icon') {
                    $configuration[$name] = array_merge($configuration[$name], $element['config']);
                } elseif ($element['type'] == 'elementTree') {
                    if (isset($element['children'])) {
                        foreach ($element['children'] as $sortIndex => $grandchild) {
                            if (isset($grandchild['config']['treeContextMenu'])) {
                                foreach (array_keys($grandchild['config']['treeContextMenu']) as $contextMenuEntry) {
                                    if (substr($grandchild['config']['type'], 0, strlen($contextMenuEntry)) != $contextMenuEntry) {
                                        unset($grandchild['config']['treeContextMenu'][$contextMenuEntry]);
                                    }
                                }
                            }
                            $grandchild['config']['sort'] = $sortIndex;
                            $grandchild['config']['position'] = 'left';
                            $configuration[$name]['elementTree'][] = $grandchild['config'];
                        }
                    }
                } elseif ($element['type'] == 'elementTreeRight') {
                    if (isset($element['children'])) {
                        foreach ($element['children'] as $sortIndex => $grandchild) {
                            if (isset($grandchild['config']['treeContextMenu'])) {
                                foreach (array_keys($grandchild['config']['treeContextMenu']) as $contextMenuEntry) {
                                    if (substr($grandchild['config']['type'], 0, strlen($contextMenuEntry)) != $contextMenuEntry) {
                                        unset($grandchild['config']['treeContextMenu'][$contextMenuEntry]);
                                    }
                                }
                            }
                            $grandchild['config']['sort'] = $sortIndex;
                            $grandchild['config']['position'] = 'right';
                            $configuration[$name]['elementTree'][] = $grandchild['config'];
                        }
                    }
                } elseif ($element['type'] == 'dashboard') {
                    if (count($element['config']) > 0 || isset($element['children'])) {
                        $configuration[$name]['dashboards'] = [];
                    }

                    if (count($element['config']) > 0) {
                        $configuration[$name]['dashboards']['disabledPortlets'] = $element['config'];
                    }

                    if (isset($element['children'])) {
                        foreach ($element['children'] as $dashboardDefinition) {
                            $configuration[$name]['dashboards']['predefined'][$dashboardDefinition['config']['name'] ?? '']['positions'] = $dashboardDefinition['config']['positions'];
                        }
                    }
                } elseif ($element['type'] == 'toolbar') {
                    if (count($element['config']) > 0 || isset($element['children'])) {
                        $configuration[$name]['toolbar'] = $element['config'];
                    }
                }
            }
        }

        return $configuration;
    }
}
