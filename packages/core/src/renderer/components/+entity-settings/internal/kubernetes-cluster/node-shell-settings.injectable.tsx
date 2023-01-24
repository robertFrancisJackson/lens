/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import getClusterByIdInjectable, { type GetClusterById } from "../../../../../common/cluster-store/get-by-id.injectable";
import { ClusterNodeShellSetting } from "../../../cluster-settings/node-shell-setting";
import type { EntitySettingViewProps, RegisteredEntitySetting } from "../../extension-registrator.injectable";
import { entitySettingInjectionToken } from "../../token";

interface Dependencies {
  getClusterById: GetClusterById;
}

function NonInjectedNodeShellKubernetesClusterSettings({ entity, getClusterById }: EntitySettingViewProps & Dependencies) {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <ClusterNodeShellSetting cluster={cluster} />
    </section>
  );
}

const NodeShellKubernetesClusterSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedNodeShellKubernetesClusterSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});

const nodeShellKubernetesClusterEntitySettingsInjectable = getInjectable({
  id: "node-shell-kubernetes-cluster-entity-settings",
  instantiate: (): RegisteredEntitySetting => {
    const apiVersions = new Set(["entity.k8slens.dev/v1alpha1"]);

    return {
      isFor: (entity) => (
        apiVersions.has(entity.apiVersion)
        && entity.kind === "KubernetesCluster"
      ),
      title: "Node Shell",
      group: "Settings",
      id: "node-shell",
      orderNumber: 45,
      components: {
        View: NodeShellKubernetesClusterSettings,
      },
    };
  },
  injectionToken: entitySettingInjectionToken,
});

export default nodeShellKubernetesClusterEntitySettingsInjectable;