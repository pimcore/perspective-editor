<?php

namespace Pimcore\Bundle\PerspectiveEditorBundle\Tests;


use Pimcore\Bundle\PerspectiveEditorBundle\Services\PerspectiveAccessor;

class PerspectiveAccessorTest extends \Codeception\Test\Unit
{
    public function testConvertTreeStoreToConfiguration()
    {
        $accessor = new PerspectiveAccessor("");

        $treeStore = [
            'parentId' => null,
            'autoRoot' => true,
            'id' => 'root',
            'leaf' => false,
            'children' => [
                0 => [
                    'id' => 'd9ba24f1-ab27-4a4e-9c67-266b2d1a1674',
                    'name' => 'Catalog',
                    'type' => 'perspective',
                    'writeable' => true,
                    'parentId' => 'root',
                    'leaf' => false,
                    'children' => [
                        0 => [
                            'id' => 'd9d72c19-747b-4a67-933d-e1c47406f105',
                            'type' => 'icon',
                            'leaf' => true,
                            'writeable' => true,
                            'config' => [
                                'iconCls' => null,
                                'icon' => '/bundles/pimcoreadmin/img/flat-white-icons/book.svg'
                            ],
                            'parentId' => 'd9ba24f1-ab27-4a4e-9c67-266b2d1a1674',
                        ],
                        1 => [
                            'id' => '7bb849d2-726d-4865-beb4-4f423e6cb3d1',
                            'type' => 'elementTree',
                            'leaf' => false,
                            'writeable' => true,
                            'parentId' => 'd9ba24f1-ab27-4a4e-9c67-266b2d1a1674',
                            'children' => [
                                0 => [
                                    'id' => '5d88a597-900e-449f-95aa-bc59e8885a06',
                                    'type' => 'elementTreeElement',
                                    'leaf' => true,
                                    'config' => [
                                        'type' => 'customview',
                                        'id' => 6,
                                        'position' => 'left',
                                        'expanded' => false,
                                        'hidden' => false,
                                        'sort' => 0
                                    ],
                                    'writeable' => true,
                                    'parentId' => '7bb849d2-726d-4865-beb4-4f423e6cb3d1',
                                ]
                            ]
                        ],
                        2 => [
                            'id' => 'bfe6e35b-d222-4d8e-80ab-6a4fdbbea24a',
                            'type' => 'elementTreeRight',
                            'leaf' => false,
                            'writeable' => true,
                            'parentId' => 'd9ba24f1-ab27-4a4e-9c67-266b2d1a1674',
                            'children' => [
                                0 => [
                                    'id' => 'faa2974f-4000-4fa2-8686-8e471479c4de',
                                    'type' => 'elementTreeElement',
                                    'leaf' => true,
                                    'config' => [
                                        'type' => 'asset',
                                        'position' => 'right',
                                        'expanded' => false,
                                        'hidden' => false,
                                        'sort' => 0
                                    ],
                                    'writeable' => true,
                                    'parentId' => 'bfe6e35b-d222-4d8e-80ab-6a4fdbbea24a',
                                ],
                                1 => [
                                    'id' => '64ba1fd3-7f39-45c8-8631-a8443f124429',
                                    'type' => 'elementTreeElement',
                                    'leaf' => true,
                                    'config' => [
                                        'type' => 'customview',
                                        'id' => 1,
                                        'position' => 'right',
                                        'expanded' => false,
                                        'hidden' => false,
                                        'sort' => 1
                                    ],
                                    'writeable' => true,
                                    'parentId' => 'bfe6e35b-d222-4d8e-80ab-6a4fdbbea24a',
                                ]
                            ]
                        ],
                        3 => [
                            'id' => '4e45676d-440f-4c4f-a96f-d81896883ff0',
                            'type' => 'dashboard',
                            'leaf' => true,
                            'config' => [],
                            'writeable' => true,
                            'parentId' => 'd9ba24f1-ab27-4a4e-9c67-266b2d1a1674',
                        ],
                        4 => [
                            'id' => 'cfa4be5e-c5de-4dc2-8f96-551a722522f8',
                            'type' => 'toolbar',
                            'leaf' => true,
                            'config' => [
                                'file' => [
                                    'hidden' => false,
                                    'items' => [
                                        'perspectives' => true,
                                        'dashboards' => true
                                    ]
                                ],
                                'marketing' => [
                                    'hidden' => true,
                                    'items' => [
                                        'reports' => true,
                                        'tagmanagemenet' => true,
                                        'targeting' => true,
                                        'seo' => [
                                            'hidden' => false,
                                            'items' => [
                                                'documents' => true,
                                                'robots' => true,
                                                'httperrors' => true
                                            ]
                                        ]
                                    ]
                                ],
                                'ecommerce' => false
                            ],
                            'writeable' => true,
                            'parentId' => 'd9ba24f1-ab27-4a4e-9c67-266b2d1a1674',
                        ]
                    ]
                ]
            ]
        ];

        $convTreeToConfig =  self::getMethod($accessor, "convertTreeStoreToConfiguration");
        $config = $convTreeToConfig->invokeArgs($accessor, [$treeStore]);

        $this->assertEquals(4, count($config['Catalog']));

        $elementTree = $config['Catalog']['elementTree'];
        $this->assertEquals(3, count($elementTree));
        $this->assertEquals(6, count($elementTree[0]));
        $this->assertEquals(6, $elementTree[0]['id']);
        $this->assertEquals('asset', $elementTree[1]['type']);
        $this->assertEquals(1, $elementTree[2]['id']);

        $toolbar = $config['Catalog']['toolbar'];
        $this->assertEquals(3, count($toolbar));
        $this->assertEquals(false, $toolbar['ecommerce']);
        $this->assertEquals(false, $toolbar['file']['hidden']);
        $this->assertEquals(2, count($toolbar['file']['items']));
        $this->assertEquals(3, count($toolbar['marketing']['items']['seo']['items']));

    }

    private static function getMethod($class, $name)
    {
        $class = new \ReflectionClass($class);
        $method = $class->getMethod($name);
        $method->setAccessible(true);

        return $method;
    }
}
