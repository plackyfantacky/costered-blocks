import { GridPanelGroup, GridPanel } from "@components/composite/GridAxisControls/GridPanelGroup";
import { HeaderToggle } from "@components/composite/GridAxisControls/HeaderToggle";
import { GridPanelSimple, GridPanelTracks  } from "@components/composite/GridAxisControls/GridPanelPanes";

import { useSelectedBlockInfo } from "@hooks";

export function GridAxisControls() {

    const { clientId, attributes, name } = useSelectedBlockInfo();

    return (
        <GridPanelGroup defaultActive="simple" key={clientId}>
            <HeaderToggle />
            <GridPanel group="simple">
                <GridPanelSimple clientId={clientId} attributes={attributes} name={name} />
            </GridPanel>
            <GridPanel group="tracks">
                <GridPanelTracks clientId={clientId} attributes={attributes} name={name} />
            </GridPanel>
        </GridPanelGroup>
    )
}