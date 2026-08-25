"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useView } from "@/components/views/ViewContext";

import HomeView from "@/components/views/HomeView";
import ExploreView from "@/components/views/ExploreView";
import BookingView from "@/components/views/BookingView";
import AccountView from "@/components/views/AccountView";
import PassengerView from "@/components/views/PassengerView";
import BillingEntityView from "@/components/views/BillingEntityView";
import PreferencesView from "@/components/views/PreferencesView";
import FleetView from "@/components/views/FleetView";
import BookingDetailView from "@/components/views/BookingDetailView";
import BookingDraftView from "@/components/views/BookingDraftView";
import PaymentView from "@/components/views/PaymentView";
import PoliciesView from "@/components/views/PoliciesView";
import ProductView from "@/components/views/ProductView";
import NotificationsView from "@/components/views/NotificationsView";
import SupportView from "@/components/views/SupportView";
import SupportThreadView from "@/components/views/SupportThreadView";
import FaqView from "@/components/views/FaqView";

export default function AppShell() {
  const { view } = useView();

  const isProduct = view.name === "product";

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={view.name}
        className="w-full h-full"
        initial={
          isProduct
            ? { y: "100%" }
            : {
                y: 20,
                opacity: 0,
                scale: 0.94,
              }
        }
        animate={
          isProduct
            ? { y: 0 }
            : {
                y: 0,
                opacity: 1,
                scale: 1,
              }
        }
        exit={
          isProduct
            ? { y: "100%" }
            : {
                y: -10,
                opacity: 0,
                scale: 0.97,
              }
        }
        transition={{
          duration: isProduct ? 0.35 : 0.28,
          ease: "easeOut",
        }}
      >
        {view.name === "home" && <HomeView />}
        {view.name === "cars" && <ExploreView />}
        {view.name === "booking" && <BookingView />}
        {view.name === "account" && <AccountView />}
        {view.name === "passengers" && <PassengerView />}
        {view.name === "corporates" && <BillingEntityView />}
        {view.name === "preferences" && <PreferencesView />}
        {view.name === "fleet" && <FleetView />}
        {view.name === "booking-detail" && (
          <BookingDetailView bookingId={view.bookingId} />
        )}
        {view.name === "booking-draft" && <BookingDraftView />}
        {view.name === "payment" && <PaymentView bookingId={view.bookingId} />}
        {view.name === "policies" && <PoliciesView />}
        {view.name === "product" && <ProductView vehicle={view.vehicle} />}
        {view.name === "notifications" && <NotificationsView />}
        {view.name === "support" && <SupportView />}
        {view.name === "support-thread" && (
          <SupportThreadView ticketId={view.ticketId} />
        )}
        {view.name === "faq" && <FaqView />}
      </motion.article>
    </AnimatePresence>
  );
}
