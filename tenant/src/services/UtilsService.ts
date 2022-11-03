import { User } from "df-shared/src/models/User";
import { DfDocument } from "../../../df-shared/src/models/DfDocument";
import { Guarantor } from "../../../df-shared/src/models/Guarantor";
import store from "../store";

export const UtilsService = {
  getMainUser() {
    return store.state.user.apartmentSharing.tenants.find((t: any) => {
      return t.tenantType === "CREATE";
    });
  },
  getTenant(id: number) {
    if (id === store.state.user.id) {
      return store.state.user;
    }
    return store.state.user.apartmentSharing.tenants.find((r: User) => {
      return r.id === id;
    }) as User;
  },
  getLastAddedGuarantor(user: User) {
    if (user.guarantors?.length && user.guarantors?.length > 0) {
      return user.guarantors[user.guarantors.length - 1] as Guarantor;
    }
    throw Error("guarantor is not found");
  },
  allDocumentsFilled() {
    return (
      this.documentsFilled() &&
      store.state.user.guarantors?.find((g: Guarantor) => {
        return !this.guarantorDocumentsFilled(g);
      }) === undefined &&
      store.state.user.apartmentSharing?.tenants
        .filter((t: User) => t.id != store.state.user?.id)
        .every((t: User) => this.documentsFilled(t)) &&
      store.state.user.apartmentSharing?.tenants
        .filter((t: User) => t.id != store.state.user?.id)
        .every((t: User) =>
          t.guarantors?.every((g: Guarantor) =>
            this.guarantorDocumentsFilled(g)
          )
        )
    );
  },
  documentsFilled(user?: User) {
    return (
      this.hasDoc("IDENTIFICATION", user) &&
      this.hasDoc("PROFESSIONAL", user) &&
      this.hasDoc("RESIDENCY", user) &&
      this.isFinancialValid(user) &&
      this.isTaxValid(user)
    );
  },
  guarantorDocumentsFilled(g: Guarantor) {
    return (
      (g.typeGuarantor === "NATURAL_PERSON" &&
        this.guarantorHasDoc("IDENTIFICATION", g) &&
        this.guarantorHasDoc("PROFESSIONAL", g) &&
        this.guarantorHasDoc("RESIDENCY", g) &&
        this.isGuarantorFinancialValid(g) &&
        this.isGuarantorTaxValid(g)) ||
      (g.typeGuarantor === "LEGAL_PERSON" &&
        this.guarantorHasDoc("IDENTIFICATION", g) &&
        this.guarantorHasDoc("IDENTIFICATION_LEGAL_PERSON", g)) ||
      (g.typeGuarantor === "ORGANISM" &&
        this.guarantorHasDoc("IDENTIFICATION", g))
    );
  },
  hasDoc(docType: string, user?: User) {
    const u = user ? user : store.state.user;
    const f = u.documents?.find((d: DfDocument) => {
      return (
        d.documentCategory === docType &&
        (d.documentStatus === "TO_PROCESS" || d.documentStatus === "VALIDATED")
      );
    })?.files;
    return f && f.length > 0;
  },
  isFinancialValid(user?: User) {
    const u = user ? user : store.state.user;
    const docs = u.documents?.filter((d: DfDocument) => {
      return d.documentCategory === "FINANCIAL";
    });
    if (!docs || docs.length === 0) {
      return false;
    }

    for (const doc of docs) {
      if (
        (!doc.noDocument && (doc.files?.length || 0) <= 0) ||
        doc.documentStatus === "DECLINED"
      ) {
        return false;
      }
    }

    return true;
  },

  isTaxValid(user?: User) {
    const u = user ? user : store.state.user;
    const doc = u.documents?.find((d: DfDocument) => {
      return d.documentCategory === "TAX";
    });
    if (!doc) {
      return false;
    }
    if (doc.files) {
      return true;
    }
    if (doc.documentSubCategory !== "my-name") {
      return true;
    }

    return false;
  },
  guarantorHasDoc(docType: string, g: Guarantor | User) {
    const f = g.documents?.find((d: DfDocument) => {
      return (
        d.documentCategory === docType &&
        (d.documentStatus === "TO_PROCESS" || d.documentStatus === "VALIDATED")
      );
    })?.files;
    return f && f.length > 0;
  },
  isGuarantorFinancialValid(g: Guarantor) {
    const docs = g.documents?.filter((d: DfDocument) => {
      return d.documentCategory === "FINANCIAL";
    });
    if (!docs || docs.length === 0) {
      return false;
    }

    for (const doc of docs) {
      if (
        (!doc.noDocument && (doc.files?.length || 0) <= 0) ||
        doc.documentStatus === "DECLINED"
      ) {
        return false;
      }
    }

    return true;
  },
  isGuarantorTaxValid(g: Guarantor) {
    const doc = g.documents?.find((d: DfDocument) => {
      return d.documentCategory === "TAX";
    });
    if (!doc) {
      return false;
    }
    if (doc.files) {
      return true;
    }
    if (doc.documentSubCategory !== "my-name") {
      return true;
    }

    return false;
  },
  isMobile() {
    return window.innerWidth < 768;
  },
  capitalize(word: string) {
    if (word.length == 0) {
      return "";
    }
    word = word[0].toUpperCase() + word.slice(1).toLowerCase();
    return word.replace(/([' -][A-Za-zÀ-ÖØ-öø-ÿ])/g, s => s.toUpperCase());
  }
};
