<?php

/**
 * This source file is available under the terms of the
 * Pimcore Open Core License (POCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 *  @copyright  Copyright (c) Pimcore GmbH (https://www.pimcore.com)
 *  @license    Pimcore Open Core License (POCL)
 */

namespace Pimcore\Bundle\PerspectiveEditorBundle\Services;

use Pimcore\Config;
use Symfony\Component\Config\Definition\Processor;

abstract class AbstractAccessor
{
    protected $configDirectory;

    protected $configuration;

    /**
     * @var null|string
     */
    protected $filename = null;

    public function __construct(string $configDirectory)
    {
        $this->configDirectory = $configDirectory;
    }

    /**
     * @param mixed $var
     * @param string $indent
     *
     * @return mixed
     */
    protected function pretty_export($var, $indent = '')
    {
        switch (gettype($var)) {
            case 'array':
                $indexed = array_keys($var) === range(0, count($var) - 1);
                $r = [];
                foreach ($var as $key => $value) {
                    $r[] = "$indent    "
                        . ($indexed ? '' : $this->pretty_export($key) . ' => ')
                        . $this->pretty_export($value, "$indent    ");
                }

                return "[\n" . implode(",\n", $r) . "\n" . $indent . ']';
            case 'string': return '"' . addcslashes(str_replace('"', '"', $var), "\\\$\r\"\n\t\v\f") . '"';
            case 'boolean': return $var ? 'true' : 'false';
            case 'integer':
            case 'double': return $var;
            default: return var_export($var, true);
        }
    }

    abstract public function getConfiguration(): array;

    /**
     * @param string $namespace
     * @param array $configuration
     *
     * @return void
     */
    public function validateConfig($namespace, $configuration)
    {
        $configurationDefinition = new \Pimcore\Bundle\CoreBundle\DependencyInjection\Configuration();
        $processor = new Processor();
        foreach ($configuration as $key => $value) {
            unset($value['writeable']);
            $processor->processConfiguration($configurationDefinition,
                ['pimcore' => [
                    $namespace => [
                        'definitions' => [
                            $key => $value
                        ]
                    ]
                ]
            ]);
        }
    }

    /**
     * @deprecated
     *
     * @param array $treeStore
     *
     * @return void
     */
    public function writeConfiguration($treeStore, ?array $deletedRecords)
    {
        $configuration = $this->convertTreeStoreToConfiguration($treeStore);

        $file = Config::locateConfigFile($this->filename);

        $str = "<?php\n return " . $this->pretty_export($configuration) . ';';
        file_put_contents($file, $str);
    }

    /**
     * @param array $treeStore
     *
     * @return array
     */
    abstract protected function convertTreeStoreToConfiguration($treeStore);
}
