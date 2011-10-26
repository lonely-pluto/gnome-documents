/*
 * Copyright (c) 2011 Red Hat, Inc.
 *
 * Gnome Documents is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Gnome Documents is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Documents; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Author: Cosimo Cecchi <cosimoc@redhat.com>
 *
 */

const Gd = imports.gi.Gd;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Global = imports.global;

const _SEARCH_ENTRY_TIMEOUT = 200;

function Searchbar() {
    this._init();
}

Searchbar.prototype = {
    _init: function() {
        this._searchFocusId = 0;
        this._searchEntryTimeout = 0;

        this.widget = new Gtk.Toolbar();
        this.widget.get_style_context().add_class(Gtk.STYLE_CLASS_PRIMARY_TOOLBAR);

        this._searchEntry = new Gtk.Entry({ width_request: 260,
                                            secondary_icon_name: 'edit-find-symbolic',
                                            secondary_icon_sensitive: false,
                                            secondary_icon_activatable: false });
        let item = new Gtk.ToolItem();
        item.set_expand(true);

        let container = new Gd.MarginContainer({ min_margin: 6,
                                                 max_margin: 64 });
        container.add(this._searchEntry);

        item.add(container);

        this._searchEntry.connect('changed', Lang.bind(this, function() {
            let text = this._searchEntry.get_text();
            if (text && text != '') {
                this._searchEntry.secondary_icon_name = 'edit-clear-symbolic';
                this._searchEntry.secondary_icon_sensitive = true;
                this._searchEntry.secondary_icon_activatable = true;
            } else {
                this._searchEntry.secondary_icon_name = 'edit-find-symbolic';
                this._searchEntry.secondary_icon_sensitive = false;
                this._searchEntry.secondary_icon_activatable = false;
            }

            if (this._searchEntryTimeout != 0) {
                Mainloop.source_remove(this._searchEntryTimeout);
                this._searchEntryTimeout = 0;
            }

            this._searchEntryTimeout = Mainloop.timeout_add(_SEARCH_ENTRY_TIMEOUT, Lang.bind(this,
                function() {
                    this._searchEntryTimeout = 0;

                    let currentText = this._searchEntry.get_text();
                    Global.searchFilterController.setFilter(currentText);
            }));
        }));

        this._searchEntry.connect('icon-release', Lang.bind(this, function() {
            this._searchEntry.set_text('');
        }));

        this._searchFocusId =
            Global.focusController.connect('focus-search', Lang.bind(this,
                function() {
                    this._searchEntry.grab_focus();
                }));

        this.widget.insert(item, 0);
        this._searchEntry.set_text(Global.searchFilterController.getFilter());
    },

    destroy: function() {
        if (this._searchFocusId != 0) {
            Global.focusController.disconnect(this._searchFocusId);
            this._searchFocusId = 0;
        }
    }
};
