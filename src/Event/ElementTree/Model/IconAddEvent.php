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

namespace Pimcore\Bundle\PerspectiveEditorBundle\Event\ElementTree\Model;

class IconAddEvent
{
    public function __construct(
        private array $elementTrees
    ) {
    }

    public function getElementTreeIcons(): array
    {
        return $this->elementTrees;
    }

    public function setElementTreeIcons(array $elementTrees): void
    {
        $this->elementTrees = $elementTrees;
    }
}
