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

use Pimcore\Config;

abstract class AbstractAccessor
{
    protected $configDirectory;
    protected $configuration;

    public function __construct(string $configDirectory)
    {
        $this->configDirectory = $configDirectory;
    }

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

    /**
     * @return array
     */
    abstract public function getConfiguration(): array;

    public function writeConfiguration($treeStore)
    {
        $configuration = $this->convertTreeStoreToConfiguration($treeStore);

        $file = Config::locateConfigFile($this->filename);

        $str = "<?php\n return " . $this->pretty_export($configuration) . ';';
        file_put_contents($file, $str);
    }

    abstract protected function convertTreeStoreToConfiguration($treeStore);

}
