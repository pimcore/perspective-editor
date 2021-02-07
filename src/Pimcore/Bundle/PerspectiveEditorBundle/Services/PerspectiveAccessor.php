<?php

namespace PerspectiveEditorBundle\Services;

class PerspectiveAccessor extends AbstractAccessor {

    protected $filename = 'perspectives.php';

    public function createFile(){
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

        $str = "<?php\n return " . $this->pretty_export($defaultConfig) . ";";
        file_put_contents($this->configDirectory.$this->filename, $str);
    }

    protected function convertTreeStoreToConfiguration($treeStore){
        $configuration = [];

        foreach($treeStore['children'] as $child){
            $configuration[$child['name']] = [];
            foreach($child['children'] as $index => $element){
                if($element['type'] == 'icon'){
                    $configuration[$child['name']] = array_merge($configuration[$child['name']], $element['config']);
                }
                else if($element['type'] == 'elementTree'){
                    $configuration[$child['name']]['elementTree'] = [];
                    if(isset($element['children'])){
                        foreach($element['children'] as $grandchild){
                            if($grandchild['config']['treeContextMenu']){
                                foreach(array_keys($grandchild['config']['treeContextMenu']) as $contextMenuEntry){
                                    if(substr($grandchild['config']['type'], 0, strlen($contextMenuEntry)) != $contextMenuEntry){
                                        unset($grandchild['config']['treeContextMenu'][$contextMenuEntry]);
                                    }
                                }
                            }
                            $configuration[$child['name']]['elementTree'][] = $grandchild['config'];
                        }
                    }
                }
                else if($element['type'] == 'dashboard'){
                    if(count($element['config']) > 0 || isset($element['children'])){
                        $configuration[$child['name']]['dashboards'] = [];
                    }

                    if(count($element['config']) > 0){
                        $configuration[$child['name']]['dashboards']['disabledPortlets'] = $element['config'];
                    }

                    if(isset($element['children'])){
                        foreach($element['children'] as $dashboardDefinition){
                            $configuration[$child['name']]['dashboards']['predefined'][$dashboardDefinition['config']['name']]['positions'] = $dashboardDefinition['config']['positions'];
                        }
                    }
                }
                else if($element['type'] == 'toolbar'){
                    if(count($element['config']) > 0 || isset($element['children'])){
                        $configuration[$child['name']]['toolbar'] = $element['config'];
                    }
                }
            }
        }

        return $configuration;
    }
}
