<?php
    defined('ABSPATH') || exit;

    function costered_things_repo(): Costered_Things_Repository {
        static $repository = null;

        if ($repository === null) {
            $repository = new Costered_Things_Repository();
        }

        return $repository;
    }

    function costered_things_get(string $thingType, string $thingKey, mixed $default = null): mixed {
        return costered_things_repo()->getByKey($thingType, $thingKey, $default);
    }

    function costered_things_get_by_costered_id(string $thingCosteredId, mixed $default = null): mixed {
        return costered_things_repo()->getByCosteredId($thingCosteredId, $default);
    }

    function costered_things_set(string $thingType, string $thingKey, mixed $thingData, ?string $thingCosteredId = null): bool {
        return costered_things_repo()->set($thingType, $thingKey, $thingData, $thingCosteredId);
    }

    function costered_things_delete(string $thingType, string $thingKey): bool {
        return costered_things_repo()->deleteByKey($thingType, $thingKey);
    }

    function costered_things_list(string $thingType): array {
        return costered_things_repo()->listByType($thingType);
    }
