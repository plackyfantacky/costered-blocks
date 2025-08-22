import { useSetOrUnsetAttrs } from "@hooks/useSetOrUnsetAttrs";
import { useSelectedBlockInfo } from "@hooks/useSelectedBlockInfo";
import { useParentAttrs } from "@hooks/useParentAttrs";
import { useAttrSetter } from "@hooks/useAttrSetter";

export {
    useSelectedBlockInfo,
    useParentAttrs,
    useSetOrUnsetAttrs, // deprecated, use useAttrsSetter instead
    useAttrSetter
}