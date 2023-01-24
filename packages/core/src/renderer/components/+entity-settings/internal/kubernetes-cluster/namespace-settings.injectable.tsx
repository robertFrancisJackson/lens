/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import getClusterByIdInjectable, { type GetClusterById } from "../../../../../common/cluster-store/get-by-id.injectable";
import { ClusterAccessibleNamespaces } from "../../../cluster-settings/accessible-namespaces";
import type { EntitySettingViewProps, RegisteredEntitySetting } from "../../extension-registrator.injectable";
import { entitySettingInjectionToken } from "../../token";

interface Dependencies {
  getClusterById: GetClusterById;
}

function NonInjectedNamespaceKubernetesClusterSettings({ entity, getClusterById }: EntitySettingViewProps & Dependencies) {
  const cluster = getClusterById(entity.getId());

  if (!cluster) {
    return null;
  }

  return (
    <section>
      <ClusterAccessibleNamespaces cluster={cluster} />
    </section>
  );
}

const NamespaceKubernetesClusterSettings = withInjectables<Dependencies, EntitySettingViewProps>(NonInjectedNamespaceKubernetesClusterSettings, {
  getProps: (di, props) => ({
    ...props,
    getClusterById: di.inject(getClusterByIdInjectable),
  }),
});

const namespaceKubernetesClusterEntitySettingsInjectable = getInjectable({
  id: "namespace-kubernetes-cluster-entity-settings",
  instantiate: ():RegisteredEntitySetting => {
    const apiVersions = new Set(["entity.k8slens.dev/v1alpha1"]);

    return {
      isFor: (entity) => (
        apiVersions.has(entity.apiVersion)
        && entity.kind === "KubernetesCluster"
      ),
      title: "Namespace",
      group: "Settings",
      id: "namespace",
      orderNumber: 30,
      components: {
        View: NamespaceKubernetesClusterSettings,
      },
    };
  },
  injectionToken: entitySettingInjectionToken,
});

export default namespaceKubernetesClusterEntitySettingsInjectable;