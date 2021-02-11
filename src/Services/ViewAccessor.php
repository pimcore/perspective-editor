<?php

namespace Pimcore\Bundle\PerspectiveEditorBundle\Services;

class ViewAccessor extends AbstractAccessor {

    protected $filename = 'customviews.php';

    public function createFile(){
        $defaultConfig =
            [
                'views' => []
            ];

        $str = "<?php\n return " . $this->pretty_export($defaultConfig) . ";";
        file_put_contents($this->configDirectory.$this->filename, $str);
    }

    public function getAvailableViews(){
        $configuration = $this->getConfiguration();
        $availableViews = [];

        if($configuration){
            foreach($configuration['views'] as $view){
                $availableViews[] = ['id' => $view['id'], 'name' => $view['name'] . ' (Type: '. $view['treetype'] .', Root: '. $view['rootfolder'] .')'];
            }
        }

        return $availableViews;
    }

    protected function convertTreeStoreToConfiguration($treeStore) {
        $configuration = [
            'views' => []
        ];

        foreach($treeStore['children'] as $child){
            if($child['config']['treeContextMenu']){
                foreach(array_keys($child['config']['treeContextMenu']) as $contextMenuEntry){
                    if(substr($child['config']['treetype'], 0, strlen($contextMenuEntry)) != $contextMenuEntry){
                        unset($child['config']['treeContextMenu'][$contextMenuEntry]);
                    }
                }
            }
            $configuration['views'][] = array_merge(['id' => $child['id']], $child['config']);
        }

        return $configuration;
    }
}
