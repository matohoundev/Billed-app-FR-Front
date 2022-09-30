/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    describe("When I click on the icon eye", () => {
      test("A modal should open", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        const store = null;
        const bill = new Bills({
          document,
          onNavigate,
          store,
          bills,
          localStorage: window.localStorage,
        });

        await waitFor(() => screen.getAllByTestId("icon-eye")[1]);
        const eye = screen.getAllByTestId("icon-eye")[1];
        $.fn.modal = jest.fn();
        const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));
        eye.addEventListener("click", handleClickIconEye);
        userEvent.click(eye);
        expect(handleClickIconEye).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalled();
      });
    });

    describe("When i click on new bill button", () => {
      test("Then then i should be redirected on the new bill page", async () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);

        const store = null;
        const bill = new Bills({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });

        await waitFor(() => screen.getAllByTestId("btn-new-bill"));
        const btn = screen.getByTestId("btn-new-bill");
        const handleClickNewBill = jest.fn(bill.handleClickNewBill);
        btn.addEventListener("click", handleClickNewBill);
        userEvent.click(btn);
        const message = await screen.getByText("Envoyer une note de frais");
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(message).toBeTruthy();
      });
    });
    test("Then we collect all the bills", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const bills = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const getBills = jest.spyOn(bills, "getBills");
      const allBills = await bills.getBills();
      expect(getBills).toHaveBeenCalled();
      expect(allBills.length).toEqual(4);
    });
  });

  // test d'intégration GET
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = await screen.getAllByText("pending").length;
      expect(contentPending).toBe(1);
      const contentAccepted = await screen.getAllByText("accepted").length;
      expect(contentAccepted).toBe(1);
      const contentRefused = await screen.getAllByText("refused").length;
      expect(contentRefused).toBe(2);
    });
  });
});
