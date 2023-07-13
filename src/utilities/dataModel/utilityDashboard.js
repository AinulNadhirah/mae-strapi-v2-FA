export function massageWidgetData({ storedWidgets, defaultWidgets, sslReady }) {
    /**
     * 1. Get widgets from AS or use default. Unlike dashboard tile, dashboard widgets does not get stored in db.
     * 2. Previous widget has only 4 item.
     *      - old users with cached widgets, we manually add SSL to first item
     * 3. New users will use our defaultWidgets, which already consist of SSL
     */
    let widgets = JSON.parse(storedWidgets) ?? defaultWidgets;
    if (sslReady) {
        const item = widgets.find((obj) => obj.id === "samaSamaLokalWidget");
        if (!item) {
            widgets.unshift({
                id: "samaSamaLokalWidget",
                title: "Order Food & More",
            });
        }
    } else {
        widgets = widgets.filter((action) => {
            return !(action.id === "samaSamaLokalWidget");
        });
    }

    return widgets;
}
