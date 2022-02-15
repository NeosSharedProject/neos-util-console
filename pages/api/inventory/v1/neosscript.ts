import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";

function isArray(value) {
  return _.isArray(value);
}

function isMap(value) {
  return _.isPlainObject(value);
}

function isValidUUID(str) {
  const uuidRegexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return typeof str == "string" && uuidRegexExp.test(str);
}

function jsonStringify(value) {
  return JSON.stringify(value);
}

function isLinkedId(id, refCountMap) {
  return _.size(_.get(refCountMap, id, [])) > 1;
}

function resolveId(id, refCountMap) {
  const useRelay = isLinkedId(id, refCountMap);
  return useRelay ? `relay.setRefId('${id}')` : `generateId('${id}')`;
}

function resolveData(value, refCountMap) {
  if (isArray(value)) {
    return `[${_(value)
      .map((v) => resolveData(v, refCountMap))
      .join(",")}]`;
  } else if (isMap(value)) {
    return `{${_(value)
      .map<any>((data, key) => {
        if (key == "ID") {
          return `"${key}":${resolveId(data, refCountMap)}`;
        } else {
          return `"${key}":${resolveData(data, refCountMap)}`;
        }
      })
      .join(",")}}`;
  } else {
    const useRelay = _.size(_.get(refCountMap, value, [])) > 1;
    return useRelay ? `relay.getRefId('${value}')` : `${jsonStringify(value)}`;
  }
}

function resolveMember(
  name,
  id,
  value,
  refCountMap,
  interfaceVariableName = null
) {
  const valueUnit =
    interfaceVariableName && (name === "Value" || name === "Reference")
      ? `\`\${${interfaceVariableName}}\``
      : resolveData(value, refCountMap);
  if (isLinkedId(id, refCountMap)) {
    const idUnit = resolveId(id, refCountMap);

    return `<Member name='${name}' content={{id: ${idUnit},value: ${valueUnit}}} />`;
  } else {
    return `<Member name='${name}' content={${valueUnit}} />`;
  }
}

function resolveComponent(
  component,
  refCountMap,
  addProp,
  isInterfaceSlot = false
) {
  const { Type, Data } = component;
  const { ID, "persistent-ID": PersistentId, UpdateOrder } = Data;
  const isInterfaceComponent =
    (_.startsWith(Type, "FrooxEngine.DynamicValueVariable`1[") ||
      _.startsWith(Type, "FrooxEngine.DynamicReferenceVariable`1[")) &&
    isInterfaceSlot;
  const interfaceVariableName = isInterfaceComponent
    ? _.get(Data, ["VariableName", "Data"])
    : null;
  if (interfaceVariableName) {
    addProp(interfaceVariableName);
  }

  const props = _(Data)
    .map<{ [name: string]: any }>((data, key) => ({
      key,
      data,
    }))
    .reject(({ key }) => _.includes(["ID", "UpdateOrder"], key))
    .value();
  return `<component name="${Type}" id={${resolveId(
    ID,
    refCountMap
  )}} persistentId={${resolveId(
    PersistentId,
    refCountMap
  )}} updateOrderId={${resolveId(UpdateOrder.ID, refCountMap)}} updateOrder="${
    UpdateOrder.Data
  }">
    ${_(props)
      .map(({ key, data }) => {
        const { ID, Data } = data ?? {};
        if (ID) {
          return resolveMember(
            key,
            ID,
            Data,
            refCountMap,
            interfaceVariableName
          );
        }
      })
      .join("")}
  </component>`;
}

function resolveSlot(slot, refCountMap, assets = [], addProp, deps = 0) {
  const {
    ID,
    "Persistent-ID": PersistentId,
    Name,
    Tag,
    Active,
    Position,
    Rotation,
    Scale,
    OrderOffset,
    Components: { Data: Components },
    Children,
  } = slot;

  const isInterface = Name.Data === "NeoscriptInterface" && deps === 1;

  const isParentAnchor = _.startsWith(Name.Data, "NeoscriptParentAnchor:");
  const parentAnchorName = _.replace(Name.Data, "NeoscriptParentAnchor:", "");
  if (isParentAnchor) {
    addProp(parentAnchorName);
  }

  return `<slot>
  <slotData id={${resolveId(ID, refCountMap)}} persistentId={${resolveId(
    PersistentId,
    refCountMap
  )}}>
  ${resolveMember("Name", Name.ID, Name.Data, refCountMap)}
  ${resolveMember("Tag", Tag.ID, Tag.Data, refCountMap)}
  ${resolveMember("Active", Active.ID, Active.Data, refCountMap)}
  ${resolveMember("Position", Position.ID, Position.Data, refCountMap)}
  ${resolveMember("Rotation", Rotation.ID, Rotation.Data, refCountMap)}
  ${resolveMember("Scale", Scale.ID, Scale.Data, refCountMap)}
  ${resolveMember("OrderOffset", OrderOffset.ID, OrderOffset.Data, refCountMap)}
  </slotData>
  <components>
  ${_(Components)
    .map((c) => resolveComponent(c, refCountMap, addProp, isInterface))
    .join("")}
  </components>
  <children>
  ${_(Children)
    .map((s) => resolveSlot(s, refCountMap, [], addProp, deps + 1))
    .join("")}
  ${isParentAnchor && `{${parentAnchorName}}`}
  </children>
  <assets>
  ${_(assets)
    .map((a) => resolveComponent(a, refCountMap, addProp))
    .join("")}
  </assets>
  </slot>`;
}

function createMemberRefList(member) {
  if (isArray(member)) {
    return _(member).map(createMemberRefList).flatMap().value();
  } else if (isMap(member)) {
    return _(member)
      .map<any>((data, key) => {
        if (key == "ID") {
          return [data];
        } else {
          return createMemberRefList(data);
        }
      })
      .flatMap()
      .value();
  } else if (isValidUUID(member)) {
    return [member];
  } else {
    return [];
  }
}

function createComponentRefList({ Data }) {
  const { ID, "persistent-ID": PersistentId, UpdateOrder } = Data;
  const props = _(Data)
    .map<any>((data, key) => ({
      key,
      data,
    }))
    .reject(({ key }) => _.includes(["ID", "UpdateOrder"], key))
    .value();
  return [
    ID,
    PersistentId,
    UpdateOrder.ID,
    ..._(props).map(createMemberRefList).flatMap().value(),
  ];
}
function createSlotRefList(slot) {
  const {
    ID,
    "Persistent-ID": PersistentId,
    Name,
    Tag,
    Active,
    Position,
    Rotation,
    Scale,
    OrderOffset,
    Components: { Data: Components },
    Children,
  } = slot;
  return [
    ID,
    PersistentId,
    Name.ID,
    Tag.ID,
    Active.ID,
    Position.ID,
    Rotation.ID,
    Scale.ID,
    OrderOffset.ID,
    ..._(Components ?? [])
      .map(createComponentRefList)
      .flatMap()
      .value(),
    ..._(Children ?? [])
      .map(createSlotRefList)
      .flatMap()
      .value(),
  ];
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { id } = req.query;
    axios
      .get(`https://decompress.kokoa.dev/?id=${id}`)
      .then(({ data }) => {
        const rootSlot = _.get(data, "Object", {});
        const assets = _.get(data, "Assets", []);
        const propList = [];
        const addProp = (prop) => {
          propList.push(prop);
        };
        const refCountMap = _([
          ...createSlotRefList(rootSlot),
          ..._(assets).map(createComponentRefList).flatMap().value(),
        ])
          .groupBy()
          .value();
        const mainString = resolveSlot(rootSlot, refCountMap, assets, addProp);
        const propDefine = _.join(propList, ",");
        res.send(
          `import React from "react";
          import { RelayManager } from "lib/neoscript/util/RelayManager";
          import { generateId } from "lib/neoscript/util";
          import { Member } from "lib/neoscript/core/Member";
          export default ({${propDefine}})=>{const relay = new RelayManager(); return (${mainString});}`
        );
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("error");
      });
  } else {
    res.status(404).send("error");
  }
};
