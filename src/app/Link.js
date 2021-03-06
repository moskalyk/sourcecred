// @flow

import React, {Component} from "react";
import {Link as RouterLink} from "react-router";
import {StyleSheet, css} from "aphrodite/no-important";

import Colors from "./Colors";

/**
 * A styled link component for both client-side router links and normal
 * external links.
 *
 * For a client-side link, specify `to={routePath}`. For a normal anchor
 * tag, specify `href={href}`.
 *
 * To add Aphrodite styles: if you would normally write
 *
 *     <a className={css(x, y, z)} />
 *
 * then specify `styles={[x, y, z]}`.
 *
 * All other properties, including `children`, are forwarded directly.
 */
type LinkProps = $ReadOnly<{
  ...React$ElementConfig<"a">,
  ...{|+to: string|} | {|+href: string|},
  +styles?: $ReadOnlyArray<
    Object | false | null | void
  > /* Aphrodite styles, as passed to `css` */,
}>;
export default class Link extends Component<LinkProps> {
  render() {
    const linkClass = css(styles.link, this.props.styles);
    const className = this.props.className
      ? `${linkClass} ${this.props.className}`
      : linkClass;
    const Tag = "to" in this.props ? RouterLink : "a";
    return (
      <Tag {...this.props} className={className}>
        {this.props.children}
      </Tag>
    );
  }
}

const colorAttributes = (color) => ({
  color: color,
  fill: color, // for child SVGs
});
const styles = StyleSheet.create({
  link: {
    ...colorAttributes(Colors.brand.medium),
    ":visited": {
      ...colorAttributes(Colors.brand.dark),
    },
    ":active": {
      ...colorAttributes(Colors.accent.medium),
    },
  },
});
