<?php

namespace Pimcore\Bundle\PerspectiveEditorBundle\Tests;


use Pimcore\Bundle\PerspectiveEditorBundle\Services\AbstractAccessor;
use Pimcore\Bundle\PerspectiveEditorBundle\Services\ViewAccessor;
use Codeception\Test\Unit;

class ViewAccessorTest extends Unit
{
    const TREE_STORE = [
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
                    'classes' => '0',
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

    const ERROR_TREE_STORE = [
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
                    'errorTestField' => 1,
                ],
                'parentId' => 'root'
            ]
        ]
    ];

    private AbstractAccessor $accessor;

    protected function setUp(): void {
        $this->accessor = new ViewAccessor("");
    }

    public function testConvertTreeStoreToConfiguration()
    {
        $convTreeToConfig =  self::getMethod($this->accessor, "convertTreeStoreToConfiguration");
        $config = $convTreeToConfig->invokeArgs($this->accessor, [self::TREE_STORE]);

        $this->assertEquals(13, count($config[1]));
        $this->assertEquals('object', $config[1]['treetype']);
        $this->assertEquals(4, count($config[1]['treeContextMenu']['object']['items']));
        $this->assertEquals(true, $config[1]['treeContextMenu']['object']['items']['addFolder']);
    }

    public function testWriteConfiguration() {
        $this->accessor->writeConfiguration(self::TREE_STORE, null);
    }

    public function testWriteConfigurationWithError() {
        $this->expectException(\Exception::class);
        $this->accessor->writeConfiguration(self::ERROR_TREE_STORE, null);
    }

    private static function getMethod($class, $name)
    {
        $class = new \ReflectionClass($class);
        $method = $class->getMethod($name);
        $method->setAccessible(true);

        return $method;
    }
}
