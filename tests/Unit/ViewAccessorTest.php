<?php

namespace Pimcore\Bundle\PerspectiveEditorBundle\Tests;


use Pimcore\Bundle\PerspectiveEditorBundle\Services\ViewAccessor;

class ViewAccessorTest extends \Codeception\Test\Unit
{
    public function testConvertTreeStoreToConfiguration()
    {
        $accessor = new ViewAccessor("");

        $treeStore = [
            'parentId' => null,
            'autoRoot' => true,
            'id' => 'root',
            'leaf' => false,
            'children' => [
                0 => [
                    'id' => 1,
                    'name' => 'view',
                    'type' => 'view',
                    'leaf' => true,
                    'writeable' => true,
                    'config' => [
                        'treetype' => 'object',
                        'name' => 'Cars',
                        'condition' => null,
                        'icon' => '/bundles/pimcoreadmin/img/flat-white-icons/automotive.svg',
                        'id' => 1,
                        'rootfolder' => '/Product Data/Cars',
                        'showroot' => false,
                        'calsses' => '0',
                        'position' => 'left',
                        'sort' => '3',
                        'expanded' => true,
                        'writeable' => true,
                        'treeContextMenu' => [
                            'object' => [
                                'items' => [
                                    'add' => true,
                                    'addFolder' => true,
                                    'importCsv' => true,
                                    'cut' => true,
                                ]
                            ],
                        ]
                    ],
                    'parentId' => 'root'
                ]
            ]
        ];

        $convTreeToConfig =  self::getMethod($accessor, "convertTreeStoreToConfiguration");
        $config = $convTreeToConfig->invokeArgs($accessor, [$treeStore]);

        $this->assertEquals(13, count($config[1]));
        $this->assertEquals('object', $config[1]['treetype']);
        $this->assertEquals(4, count($config[1]['treeContextMenu']['items']));
        $this->assertEquals(true, $config[1]['treeContextMenu']['items']['addFolder']);
    }

    private static function getMethod($class, $name)
    {
        $class = new \ReflectionClass($class);
        $method = $class->getMethod($name);
        $method->setAccessible(true);

        return $method;
    }
}
