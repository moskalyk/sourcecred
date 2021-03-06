// @flow
import {StyleSheet} from "aphrodite/no-important";
import {shallow} from "enzyme";
import React from "react";
import {Link as RouterLink} from "react-router";

import Link from "./Link";

require("./testUtil").configureAphrodite();
require("./testUtil").configureEnzyme();

describe("src/app/Link", () => {
  const styles = StyleSheet.create({
    x: {fontWeight: "bold"},
  });

  // Static type checks
  void [
    // Must specify either `href` or `to`
    <Link href="https://example.com/">click me</Link>,
    <Link to="/prototype">click me, too</Link>,
    // $ExpectFlowError
    <Link>missing to/href</Link>,

    // May specify styles
    <Link href="#" styles={[styles.x, styles.y /* nonexistent */]} />,

    // May specify extra properties
    <Link href="#" onClick={() => void alert("hi")} tabIndex={3} />,
  ];

  it("renders a styled external link", () => {
    const element = shallow(<Link href="https://example.com/">click me</Link>);
    expect(element.type()).toBe("a");
    expect(element.prop("href")).toEqual("https://example.com/");
    expect(element.children().text()).toEqual("click me");
    expect(typeof element.prop("className")).toBe("string");
  });

  it("renders a styled router link", () => {
    const element = shallow(<Link to="/prototype">check it out</Link>);
    expect(element.type()).toEqual(RouterLink);
    expect(element.prop("to")).toEqual("/prototype");
    expect(element.children().text()).toEqual("check it out");
    expect(typeof element.prop("className")).toBe("string");
  });

  it("has deterministic className", () => {
    const e1 = shallow(<Link href="#" />);
    const e2 = shallow(<Link href="#" />);
    expect(e2.prop("className")).toEqual(e1.prop("className"));
  });

  it("adds specified Aphrodite styles", () => {
    const e1 = shallow(<Link href="#" />);
    const e2 = shallow(<Link href="#" styles={[styles.x]} />);
    expect(e2.prop("className")).not.toEqual(e1.prop("className"));
  });

  it("forwards class name", () => {
    const e1 = shallow(<Link href="#" />);
    const e2 = shallow(<Link href="#" className="ohai" />);
    expect(e2.prop("className")).toEqual(e1.prop("className") + " ohai");
  });

  it("forwards other props, like `onClick` and `tabIndex`", () => {
    const fn = () => {};
    const element = shallow(<Link href="#" onClick={fn} tabIndex={77} />);
    expect(element.prop("onClick")).toBe(fn);
    expect(element.prop("tabIndex")).toBe(77);
  });
});
