/* =====================================================
   SANTO ROSARIO ELEMENTARY SCHOOL
   SUPPLIES STOCK MANAGEMENT SYSTEM
   MAIN APPLICATION JAVASCRIPT
===================================================== */
// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = "https://qhywojmohghizqjhellk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_LEg17vE4VN7RIIj-n86SKQ_cBMhMvx6";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            // Do not remember login after refresh/restart
            persistSession: false,

            // Session only lives while this page is open
            autoRefreshToken: false,

            // No automatic login from URL
            detectSessionInUrl: false
        }
    }
);

// =====================================================
// SUPABASE AUTHENTICATION
// =====================================================

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");


// -----------------------------------------------------
// SHOW LOGIN
// -----------------------------------------------------

function showLoginScreen() {

    if (loginScreen) {
        loginScreen.classList.remove("hidden");
    }

    if (logoutBtn) {
        logoutBtn.style.display = "none";
    }
}


// -----------------------------------------------------
// HIDE LOGIN
// -----------------------------------------------------

function hideLoginScreen() {

    if (loginScreen) {
        loginScreen.classList.add("hidden");
    }

    if (logoutBtn) {
        logoutBtn.style.display = "inline-flex";
    }
}


// -----------------------------------------------------
// LOGIN
// -----------------------------------------------------

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        loginMessage.textContent = "";

        if (!email || !password) {
            loginMessage.textContent = "Please enter your email and password.";
            return;
        }

        const loginButton = loginForm.querySelector("button[type='submit']");

        loginButton.disabled = true;
        loginButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Logging in...
        `;

        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) {
                throw error;
            }

            if (data.session) {

                loginMessage.textContent = "";

                hideLoginScreen();

                // LOAD DATA FROM SUPABASE
                const loaded = await loadSupplies();

                if (loaded) {

                renderDashboard();
                renderInventory();
                renderReports();
                renderUsers();

                }

            }

        } catch (error) {

            console.error("Login error:", error);

            loginMessage.textContent =
                error.message || "Login failed. Please check your credentials.";

        } finally {

            loginButton.disabled = false;

            loginButton.innerHTML = `
                <i class="fa-solid fa-right-to-bracket"></i>
                Login
            `;
        }

    });
}


// -----------------------------------------------------
// LOGOUT
// -----------------------------------------------------

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        try {

            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            showLoginScreen();

            loginForm.reset();

        } catch (error) {

            console.error("Logout error:", error);

            alert("Logout failed. Please try again.");

        }

    });
}


// -----------------------------------------------------
// CHECK CURRENT SESSION
// -----------------------------------------------------

async function checkAuth() {

    try {

        const {
            data: { session }
        } = await supabaseClient.auth.getSession();

        if (session) {

            hideLoginScreen();

            // LOAD SUPPLIES FROM SUPABASE
            const loaded = await loadSupplies();

            if (loaded) {

                renderDashboard();
                renderInventory();
                renderReports();
                renderUsers();

            }

        } else {

            showLoginScreen();

        }

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        showLoginScreen();

    }
}


// -----------------------------------------------------
// AUTH STATE LISTENER
// -----------------------------------------------------

supabaseClient.auth.onAuthStateChange(
    function (event, session) {

        if (session) {

            hideLoginScreen();

        } else {

            showLoginScreen();

        }

    }
);


// Check authentication
checkAuth();

/* =====================================================
   DEFAULT DATA
===================================================== */

const defaultSupplies = [
    {
        id: 1,
        name: "Pencils",
        category: "Writing",
        quantity: 250,
        minimum: 30
    },
    {
        id: 2,
        name: "Notebooks",
        category: "Paper",
        quantity: 180,
        minimum: 30
    },
    {
        id: 3,
        name: "Erasers",
        category: "Writing",
        quantity: 35,
        minimum: 20
    },
    {
        id: 4,
        name: "Bond Paper",
        category: "Paper",
        quantity: 500,
        minimum: 50
    },
    {
        id: 5,
        name: "Paint Brush",
        category: "Art",
        quantity: 10,
        minimum: 15
    }
];


const defaultUsers = [
    {
        id: 1,
        name: "Administrator",
        username: "admin",
        role: "Administrator",
        status: "Active"
    }
];


/* =====================================================
   SUPABASE SUPPLIES STORAGE
===================================================== */

let suppliesCache = [];


/* -----------------------------------------------------
   GET SUPPLIES FROM SUPABASE
----------------------------------------------------- */

function getSupplies() {

    return suppliesCache;

}


/* -----------------------------------------------------
   LOAD SUPPLIES FROM DATABASE
----------------------------------------------------- */

async function loadSupplies() {

    const {
        data,
        error
    } = await supabaseClient
        .from("supplies")
        .select("*")
        .order("id", {
            ascending: true
        });


    if (error) {

        console.error(
            "Error loading supplies:",
            error
        );

        alert(
            "Unable to load supplies from the database."
        );

        return false;
    }


    suppliesCache = data.map(supply => ({

        id: Number(supply.id),

        name: supply.name,

        category: supply.category,

        quantity: Number(supply.quantity),

        minimum: Number(supply.minimum_stock)

    }));


    return true;
}


/* -----------------------------------------------------
   SAVE SUPPLIES
   NOTE:
   Supplies are now saved directly through
   Supabase INSERT / UPDATE / DELETE.
----------------------------------------------------- */

function saveSupplies(supplies) {

    suppliesCache = supplies;

}

/* =====================================================
   PAGE NAVIGATION
===================================================== */

const pageInfo = {

    dashboard: {
        title: "Dashboard",
        subtitle: "School supplies overview"
    },

    inventory: {
        title: "Inventory",
        subtitle: "Manage school supplies"
    },

    "add-supply": {
        title: "Add Supply",
        subtitle: "Add a new school supply"
    },

    transact: {
        title: "Transact",
        subtitle: "Record stock movement"
    },

    reports: {
        title: "Reports",
        subtitle: "Inventory and transaction reports"
    },

    users: {
        title: "Users",
        subtitle: "Manage system users"
    }

};


function showSection(sectionName) {

    document.querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove("active");

        });
    const sectionIds = {
        dashboard: "dashboardSection",
        inventory: "inventorySection",
        "add-supply": "addSupplySection",
        transact: "transactSection",
        reports: "reportsSection",
        users: "usersSection"
};

const target = document.getElementById(
    sectionIds[sectionName]
);


    if (!target) {
        return;
    }


    target.classList.add("active");


    document.querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

            if (
                item.dataset.section === sectionName
            ) {

                item.classList.add("active");

            }

        });


    if (pageInfo[sectionName]) {

        document.getElementById("pageTitle").textContent =
            pageInfo[sectionName].title;

        document.getElementById("pageSubtitle").textContent =
            pageInfo[sectionName].subtitle;

    }


    document.getElementById("globalSearch").value = "";


    if (sectionName === "dashboard") {

        renderDashboard();

    }

    if (sectionName === "inventory") {

        renderInventory();

    }

    if (sectionName === "transact") {

        populateTransactionSupplies();

    }

    if (sectionName === "reports") {

        renderReports();

    }

    if (sectionName === "users") {

        renderUsers();

    }


    document.getElementById("sidebar")
        .classList.remove("show");
}


/* =====================================================
   NAVIGATION EVENTS
===================================================== */

document.querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener("click", () => {

            showSection(button.dataset.section);

        });

    });


document.querySelectorAll("[data-section-target]")
    .forEach(button => {

        button.addEventListener("click", () => {

            showSection(
                button.dataset.sectionTarget
            );

        });

    });


/* =====================================================
   CATEGORY ICON
===================================================== */

function getCategoryIcon(category) {

    const icons = {

        Writing: "fa-pencil",

        Paper: "fa-file",

        Art: "fa-paintbrush",

        Cleaning: "fa-broom",

        Office: "fa-folder",

        Other: "fa-box"

    };

    return icons[category] || "fa-box";
}


/* =====================================================
   STATUS
===================================================== */

function getStatus(quantity, minimum) {

    if (quantity === 0) {

        return {
            text: "Out of Stock",
            className: "out-stock"
        };

    }


    if (quantity <= minimum) {

        return {
            text: "Low Stock",
            className: "low-stock"
        };

    }


    return {
        text: "In Stock",
        className: "in-stock"
    };
}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {

    const supplies = getSupplies();
    


    let totalItems = 0;
    let inStockCount = 0;
    let lowStockCount = 0;


    supplies.forEach(supply => {

        totalItems += Number(supply.quantity);


        if (supply.quantity > supply.minimum) {

            inStockCount++;

        }
        else if (supply.quantity > 0) {

            lowStockCount++;

        }

    });


    document.getElementById("totalSupplies")
        .textContent = supplies.length;

    document.getElementById("inStock")
        .textContent = inStockCount;

    document.getElementById("lowStock")
        .textContent = lowStockCount;

    document.getElementById("totalItems")
        .textContent = totalItems;


    renderDashboardInventory();

    renderDashboardTransactions();
}


/* =====================================================
   DASHBOARD INVENTORY
===================================================== */

function renderDashboardInventory() {

    const supplies = getSupplies();

    const body = document.getElementById(
        "dashboardInventoryBody"
    );


    body.innerHTML = "";


    supplies.slice(0, 5).forEach(supply => {

        const status = getStatus(
            supply.quantity,
            supply.minimum
        );


        body.innerHTML += `

            <tr>

                <td>

                    <div class="supply-name">

                        <div class="supply-icon">

                            <i class="fa-solid
                                ${getCategoryIcon(supply.category)}">
                            </i>

                        </div>

                        <strong>
                            ${escapeHTML(supply.name)}
                        </strong>

                    </div>

                </td>

                <td>
                    ${escapeHTML(supply.category)}
                </td>

                <td>
                    ${supply.quantity}
                </td>

                <td>

                    <span class="status ${status.className}">
                        ${status.text}
                    </span>

                </td>

            </tr>

        `;

    });


    if (supplies.length === 0) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="text-align:center;padding:30px;"
                >
                    No supplies available.
                </td>

            </tr>

        `;

    }
}


/* =====================================================
   DASHBOARD TRANSACTIONS
===================================================== */

async function renderDashboardTransactions() {
    const container = document.getElementById("dashboardTransactions");

    if (!container) return;

    container.innerHTML = `
        <div style="text-align:center;padding:25px;">
            Loading transactions...
        </div>
    `;

    try {
        const { data, error } = await supabaseClient
            .from("transactions")
            .select(`
                id,
                type,
                quantity,
                remarks,
                created_at,
                supply_id,
                supplies (
                    name
                )
            `)
            .order("created_at", { ascending: false })
            .limit(5);

        if (error) {
            console.error("DASHBOARD TRANSACTIONS ERROR:", error);

            container.innerHTML = `
                <div style="text-align:center;padding:25px;">
                    Failed to load recent transactions.
                </div>
            `;

            return;
        }

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:25px;">
                    No transactions recorded yet.
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        data.forEach(transaction => {
            const supplyName =
                transaction.supplies
                    ? transaction.supplies.name
                    : "Unknown Supply";

            const date = new Date(
                transaction.created_at
            ).toLocaleString();

            const transactionLabel =
                transaction.type === "in"
                    ? "Stock In"
                    : "Stock Out";

            container.innerHTML += `
                <div class="transaction-item">
                    <div>
                        <strong>${escapeHTML(supplyName)}</strong>

                        <div style="font-size:12px;color:#777;">
                            ${escapeHTML(date)}
                        </div>
                    </div>

                    <div>
                        <span class="status ${
                            transaction.type === "in"
                                ? "in-stock"
                                : "out-stock"
                        }">
                            ${transactionLabel}
                        </span>

                        <div style="text-align:right;margin-top:4px;">
                            ${transaction.quantity} items
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error(
            "Unexpected dashboard transactions error:",
            error
        );

        container.innerHTML = `
            <div style="text-align:center;padding:25px;">
                Something went wrong while loading transactions.
            </div>
        `;
    }
}


/* =====================================================
   INVENTORY
===================================================== */

function renderInventory() {

    const supplies = getSupplies();

    const body = document.getElementById(
        "inventoryBody"
    );


    const category =
        document.getElementById("categoryFilter").value;


    const search =
        document.getElementById("globalSearch").value
            .toLowerCase();


    const filtered = supplies.filter(supply => {

        const matchesCategory =
            category === "all" ||
            supply.category === category;


        const matchesSearch =
            supply.name.toLowerCase().includes(search) ||
            supply.category.toLowerCase().includes(search);


        return matchesCategory && matchesSearch;

    });


    body.innerHTML = "";


    filtered.forEach(supply => {

        const status = getStatus(
            supply.quantity,
            supply.minimum
        );


        body.innerHTML += `

            <tr>

                <td>

                    <div class="supply-name">

                        <div class="supply-icon">

                            <i class="fa-solid
                                ${getCategoryIcon(supply.category)}">
                            </i>

                        </div>

                        <strong>
                            ${escapeHTML(supply.name)}
                        </strong>

                    </div>

                </td>

                <td>
                    ${escapeHTML(supply.category)}
                </td>

                <td>
                    ${supply.quantity}
                </td>

                <td>
                    ${supply.minimum}
                </td>

                <td>

                    <span class="status ${status.className}">
                        ${status.text}
                    </span>

                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="action-btn edit-btn"
                            onclick="openEditSupply(${supply.id})"
                            title="Edit"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>

                </td>

            </tr>

        `;

    });


    if (filtered.length === 0) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center;padding:35px;"
                >
                    No supplies found.
                </td>

            </tr>

        `;

    }


    updateInventorySummary();
}


/* =====================================================
   INVENTORY SUMMARY
===================================================== */

function updateInventorySummary() {

    const supplies = getSupplies();


    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;


    supplies.forEach(supply => {

        if (supply.quantity === 0) {

            outOfStock++;

        }
        else if (supply.quantity <= supply.minimum) {

            lowStock++;

        }
        else {

            inStock++;

        }

    });


    document.getElementById(
        "inventoryTotalSupplies"
    ).textContent = supplies.length;


    document.getElementById(
        "inventoryInStock"
    ).textContent = inStock;


    document.getElementById(
        "inventoryLowStock"
    ).textContent = lowStock;


    document.getElementById(
        "inventoryOutOfStock"
    ).textContent = outOfStock;
}


/* =====================================================
   CATEGORY FILTER
===================================================== */

document.getElementById("categoryFilter")
    .addEventListener("change", () => {

        renderInventory();

    });


/* =====================================================
   ADD SUPPLY
===================================================== */

document.getElementById("addSupplyForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("supplyName")
                .value.trim();

        const category =
            document.getElementById("supplyCategory")
                .value;

        const quantity =
            Number(
                document.getElementById("supplyQuantity")
                    .value
            );

        const minimum =
            Number(
                document.getElementById("minimumStock")
                    .value
            );


        if (!name || !category) {

            alert(
                "Please complete all required fields."
            );

            return;
        }


        if (
            Number.isNaN(quantity) ||
            Number.isNaN(minimum) ||
            quantity < 0 ||
            minimum < 0
        ) {

            alert(
                "Quantity and minimum stock cannot be negative."
            );

            return;
        }


        try {

            const { data, error } =
                await supabaseClient
                    .from("supplies")
                    .insert({
                        name: name,
                        category: category,
                        quantity: quantity,
                        minimum_stock: minimum
                    })
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Add supply error:",
                    error
                );

                alert(
                    "Failed to add supply:\n\n" +
                    error.message
                );

                return;
            }


            /* ADD TO LOCAL CACHE */

            suppliesCache.push({
                id: Number(data.id),
                name: data.name,
                category: data.category,
                quantity: Number(data.quantity),
                minimum: Number(data.minimum_stock)
            });


            alert(
                "Supply added successfully!"
            );


            this.reset();


            showSection("inventory");

        }
        catch (error) {

            console.error(
                "Unexpected add supply error:",
                error
            );

            alert(
                "Something went wrong while adding the supply.\n\n" +
                error.message
            );
        }

    });

/* =====================================================
   EDIT SUPPLY
===================================================== */

function openEditSupply(id) {

    const supplies = getSupplies();

    const supply = supplies.find(
        item => Number(item.id) === Number(id)
    );

    if (!supply) {
        alert("Supply not found.");
        return;
    }

    document.getElementById("editId").value =
        supply.id;

    document.getElementById("editName").value =
        supply.name;

    document.getElementById("editCategory").value =
        supply.category;

    document.getElementById("editQuantity").value =
        supply.quantity;

    document.getElementById("editMinimum").value =
        supply.minimum;

    document.getElementById("editModal")
        .classList.add("show");
}


document.getElementById("editForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const id =
            Number(
                document.getElementById("editId").value
            );

        const name =
            document.getElementById("editName")
                .value.trim();

        const category =
            document.getElementById("editCategory")
                .value;

        const quantity =
            Number(
                document.getElementById("editQuantity")
                    .value
            );

        const minimum =
            Number(
                document.getElementById("editMinimum")
                    .value
            );


        /* VALIDATION */

        if (!name || !category) {

            alert(
                "Please complete all required fields."
            );

            return;
        }


        if (
            Number.isNaN(quantity) ||
            Number.isNaN(minimum) ||
            quantity < 0 ||
            minimum < 0
        ) {

            alert(
                "Quantity and minimum stock cannot be negative."
            );

            return;
        }


        try {

            /* UPDATE SUPABASE */

            const { error } =
                await supabaseClient
                    .from("supplies")
                    .update({
                        name: name,
                        category: category,
                        quantity: quantity,
                        minimum_stock: minimum
                    })
                    .eq("id", id);


            if (error) {

                console.error(
                    "UPDATE SUPPLY ERROR:",
                    error
                );

                alert(
                    "Failed to update supply:\n\n" +
                    error.message
                );

                return;
            }


            /* UPDATE LOCAL CACHE */

            const supplies = getSupplies();

            const supply = supplies.find(
                item => Number(item.id) === id
            );

            if (supply) {

                supply.name = name;
                supply.category = category;
                supply.quantity = quantity;
                supply.minimum = minimum;

                saveSupplies(supplies);
            }


            /* CLOSE MODAL */

            closeEditModal();


            /* REFRESH UI */

            renderInventory();
            renderDashboard();


            alert(
                "Supply updated successfully!"
            );

        }
        catch (error) {

            console.error(
                "Unexpected update error:",
                error
            );

            alert(
                "Something went wrong while updating the supply.\n\n" +
                error.message
            );
        }

    });

    /* =====================================================
   DELETE SUPPLY
===================================================== */

document.getElementById("deleteSupplyBtn")
    .addEventListener("click", async function() {

        const id =
            Number(
                document.getElementById("editId")
                    .value
            );


        const supply =
            suppliesCache.find(
                item => Number(item.id) === id
            );


        if (!supply) {

            alert("Supply not found.");

            return;
        }


        const confirmed = confirm(
            `Are you sure you want to delete "${supply.name}"?`
        );


        if (!confirmed) {

            return;
        }


        try {

            const { error } =
                await supabaseClient
                    .from("supplies")
                    .delete()
                    .eq("id", id);


            if (error) {

                console.error(
                    "Delete supply error:",
                    error
                );

                alert(
                    "Failed to delete supply:\n" +
                    error.message
                );

                return;
            }


            suppliesCache =
                suppliesCache.filter(
                    item =>
                        Number(item.id) !== id
                );


            closeEditModal();


            renderInventory();

            renderDashboard();


            alert(
                "Supply deleted successfully!"
            );


        } catch (error) {

            console.error(
                "Unexpected delete error:",
                error
            );

            alert(
                "Something went wrong while deleting the supply."
            );

        }

    });


/* =====================================================
   EDIT MODAL
===================================================== */

function closeEditModal() {

    document.getElementById("editModal")
        .classList.remove("show");

}


document.getElementById("closeEditModal")
    .addEventListener(
        "click",
        closeEditModal
    );


document.getElementById("cancelEdit")
    .addEventListener(
        "click",
        closeEditModal
    );


document.getElementById("editModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeEditModal();

        }

    });


/* =====================================================
   TRANSACTIONS
===================================================== */

function populateTransactionSupplies() {

    const supplies = getSupplies();

    const select =
        document.getElementById("transactionSupply");


    const currentValue = select.value;


    select.innerHTML = `

        <option value="">
            Select a supply
        </option>

    `;


    supplies.forEach(supply => {

        select.innerHTML += `

            <option value="${supply.id}">

                ${escapeHTML(supply.name)}
                (${supply.quantity} available)

            </option>

        `;

    });


    select.value = currentValue;
}


/* =====================================================
   TRANSACTION FORM - SUPABASE
===================================================== */

document.getElementById("transactionForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const type =
            document.querySelector(
                'input[name="transactionType"]:checked'
            ).value;

        const supplyId =
            Number(
                document.getElementById("transactionSupply").value
            );

        const quantity =
            Number(
                document.getElementById("transactionQuantity").value
            );

        const remarks =
            document.getElementById("transactionRemarks")
                .value.trim();


        /* ==========================================
           VALIDATION
        ========================================== */

        if (!supplyId) {

            alert("Please select a supply.");

            return;
        }


        if (
            Number.isNaN(quantity) ||
            quantity <= 0
        ) {

            alert("Please enter a valid quantity.");

            return;
        }


        /* ==========================================
           FIND SUPPLY
        ========================================== */

        const supplies = getSupplies();

        const supply = supplies.find(
            item => Number(item.id) === supplyId
        );


        if (!supply) {

            alert("Supply not found.");

            return;
        }


        /* ==========================================
           STOCK OUT VALIDATION
        ========================================== */

        if (
            type === "out" &&
            quantity > supply.quantity
        ) {

            alert(
                `Not enough stock available.\n\n` +
                `Current stock: ${supply.quantity}`
            );

            return;
        }


        /* ==========================================
           CALCULATE NEW QUANTITY
        ========================================== */

        let newQuantity;

        if (type === "in") {

            newQuantity =
                supply.quantity + quantity;

        } else {

            newQuantity =
                supply.quantity - quantity;

        }


        try {

            /* ==========================================
               UPDATE SUPABASE SUPPLIES
            ========================================== */

            const { error: supplyError } =
                await supabaseClient
                    .from("supplies")
                    .update({
                        quantity: newQuantity
                    })
                    .eq("id", supplyId);


            if (supplyError) {

                console.error(
                    "SUPPLY UPDATE ERROR:",
                    supplyError
                );

                alert(
                    "Failed to update stock:\n\n" +
                    supplyError.message
                );

                return;
            }


            /* ==========================================
               SAVE TRANSACTION TO SUPABASE
            ========================================== */

            const { data: transactionData, error: transactionError } =
                await supabaseClient
                    .from("transactions")
                    .insert({
                        supply_id: supplyId,
                        type: type,
                        quantity: quantity,
                        remarks: remarks || null
                    })
                    .select()
                    .single();


            /* ==========================================
               TRANSACTION INSERT FAILED
            ========================================== */

            if (transactionError) {

                console.error(
                    "TRANSACTION INSERT ERROR:",
                    transactionError
                );


                /*
                   IMPORTANT:
                   Revert the supply quantity because
                   the transaction was not saved.
                */

                await supabaseClient
                    .from("supplies")
                    .update({
                        quantity: supply.quantity
                    })
                    .eq("id", supplyId);


                alert(
                    "Transaction could not be saved.\n\n" +
                    transactionError.message
                );

                return;
            }


            /* ==========================================
               UPDATE LOCAL CACHE
            ========================================== */

            supply.quantity = newQuantity;

            saveSupplies(supplies);


            /* ==========================================
               SUCCESS
            ========================================== */

            alert(
                type === "in"
                    ? "Stock In recorded successfully!"
                    : "Stock Out recorded successfully!"
            );


            /* RESET FORM */

            this.reset();


            /* DEFAULT BACK TO STOCK IN */

            document.querySelector(
                'input[name="transactionType"][value="in"]'
            ).checked = true;


            /* REFRESH DATA FROM SUPABASE */

            await loadSupplies();


            renderDashboard();

            renderInventory();

            renderReports();

            populateTransactionSupplies();


            /* GO TO DASHBOARD */

            showSection("dashboard");


        } catch (error) {

            console.error(
                "Unexpected transaction error:",
                error
            );

            alert(
                "Something went wrong while recording the transaction.\n\n" +
                error.message
            );

        }

    });

/* =====================================================
   REPORTS - SUPABASE
===================================================== */

async function renderReports() {

    const body =
        document.getElementById("reportsBody");

    body.innerHTML = `
        <tr>
            <td
                colspan="5"
                style="text-align:center;padding:35px;"
            >
                Loading transactions...
            </td>
        </tr>
    `;


    try {

        /* ==========================================
           LOAD TRANSACTIONS FROM SUPABASE
        ========================================== */

        const { data, error } =
            await supabaseClient
                .from("transactions")
                .select(`
                    id,
                    type,
                    quantity,
                    remarks,
                    created_at,
                    supply_id,
                    supplies (
                        name
                    )
                `)
                .order("created_at", {
                    ascending: false
                });


        if (error) {

            console.error(
                "REPORTS LOAD ERROR:",
                error
            );

            body.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        style="text-align:center;padding:35px;"
                    >
                        Failed to load transactions.
                    </td>
                </tr>
            `;

            return;
        }


        /* ==========================================
           COUNT TRANSACTIONS
        ========================================== */

        let stockIn = 0;
        let stockOut = 0;


        data.forEach(transaction => {

            if (transaction.type === "in") {

                stockIn++;

            } else {

                stockOut++;

            }

        });


        /* ==========================================
           RENDER TRANSACTIONS
        ========================================== */

        body.innerHTML = "";


        data.forEach(transaction => {

            const date =
                new Date(
                    transaction.created_at
                ).toLocaleString();


            const supplyName =
                transaction.supplies
                    ? transaction.supplies.name
                    : "Unknown Supply";


            body.innerHTML += `

                <tr>

                    <td>
                        ${escapeHTML(date)}
                    </td>

                    <td>
                        ${escapeHTML(supplyName)}
                    </td>

                    <td>

                        <span class="status
                            ${transaction.type === "in"
                                ? "in-stock"
                                : "out-stock"}">

                            ${transaction.type === "in"
                                ? "Stock In"
                                : "Stock Out"}

                        </span>

                    </td>

                    <td>
                        ${transaction.quantity}
                    </td>

                    <td>
                        ${escapeHTML(
                            transaction.remarks || "-"
                        )}
                    </td>

                </tr>

            `;

        });


        /* ==========================================
           EMPTY STATE
        ========================================== */

        if (data.length === 0) {

            body.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        style="text-align:center;padding:35px;"
                    >
                        No transactions recorded yet.
                    </td>

                </tr>

            `;

        }


        /* ==========================================
           UPDATE REPORT SUMMARY
        ========================================== */

        document.getElementById(
            "totalTransactions"
        ).textContent = data.length;


        document.getElementById(
            "totalStockIn"
        ).textContent = stockIn;


        document.getElementById(
            "totalStockOut"
        ).textContent = stockOut;


    } catch (error) {

        console.error(
            "Unexpected reports error:",
            error
        );

        body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;padding:35px;"
                >
                    Something went wrong while loading reports.
                </td>

            </tr>

        `;

    }

}

/* =====================================================
   CLEAR TRANSACTION HISTORY
===================================================== */

document.addEventListener("click", async function(event) {

    const clearButton =
        event.target.closest("#clearTransactionsBtn");

    if (!clearButton) {
        return;
    }

    console.log("=================================");
    console.log("CLEAR HISTORY BUTTON CLICKED");
    console.log("=================================");

    try {

        /* ==========================================
           CHECK TRANSACTIONS
        ========================================== */

        const { data, error } =
            await supabaseClient
                .from("transactions")
                .select("id")
                .limit(1);

        if (error) {

            console.error(
                "CHECK TRANSACTIONS ERROR:",
                error
            );

            alert(
                "Unable to check transaction history:\n\n" +
                error.message
            );

            return;
        }


        /* ==========================================
           NO TRANSACTIONS
        ========================================== */

        if (!data || data.length === 0) {

            alert(
                "There are no transactions to clear."
            );

            return;
        }


        /* ==========================================
           CONFIRM
        ========================================== */

        const confirmed = confirm(
            "Are you sure you want to clear ALL transaction history?\n\n" +
            "This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }


        /* ==========================================
           DELETE ALL TRANSACTIONS
        ========================================== */

        console.log("Deleting transaction history...");

        const { error: deleteError } =
            await supabaseClient
                .from("transactions")
                .delete()
                .not("id", "is", null);


        if (deleteError) {

            console.error(
                "DELETE TRANSACTIONS ERROR:",
                deleteError
            );

            alert(
                "Failed to clear transaction history:\n\n" +
                deleteError.message
            );

            return;
        }


        console.log(
            "Transaction history successfully deleted."
        );


        /* ==========================================
           REFRESH REPORTS
        ========================================== */

        await renderReports();


        /* ==========================================
           REFRESH DASHBOARD TRANSACTIONS
        ========================================== */

        await renderDashboardTransactions();


        /* ==========================================
           SUCCESS
        ========================================== */

        alert(
            "All transaction history has been cleared successfully!"
        );

    }
    catch (error) {

        console.error(
            "CLEAR HISTORY UNEXPECTED ERROR:",
            error
        );

        alert(
            "Something went wrong while clearing history:\n\n" +
            error.message
        );

    }

});

// ==========================================
// USERS MANAGEMENT - SUPABASE
// ==========================================

async function renderUsers(searchTerm = "") {

    const body = document.getElementById("usersBody");

    if (!body) return;

    body.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;padding:35px;">
                Loading users...
            </td>
        </tr>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("users")
            .select("*")
            .order("id", { ascending: true });

        if (error) {

            console.error("USERS LOAD ERROR:", error);

            body.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:35px;">
                        Failed to load users.
                    </td>
                </tr>
            `;

            return;
        }

        let users = data || [];

        // Search
        const search = searchTerm.trim().toLowerCase();

        if (search) {

            users = users.filter(user =>
                user.name.toLowerCase().includes(search) ||
                user.username.toLowerCase().includes(search) ||
                user.role.toLowerCase().includes(search) ||
                user.status.toLowerCase().includes(search)
            );

        }

        if (users.length === 0) {

            body.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;padding:35px;">
                        No users found.
                    </td>
                </tr>
            `;

            return;
        }

        body.innerHTML = "";

        users.forEach(user => {

            const statusClass =
                user.status === "Active"
                    ? "in-stock"
                    : "low-stock";

            const isAdmin =
                user.username.toLowerCase() === "admin";

            body.innerHTML += `
                <tr>

                    <td>
                        ${escapeHTML(user.name)}
                    </td>

                    <td>
                        ${escapeHTML(user.username)}
                    </td>

                    <td>
                        ${escapeHTML(user.role)}
                    </td>

                    <td>
                        <span class="status ${statusClass}">
                            ${escapeHTML(user.status)}
                        </span>
                    </td>

                    <td>

                        ${
                            isAdmin

                            ? `
                                <span style="color:#64748b;">
                                    Default Account
                                </span>
                              `

                            : `
                                <button
                                    class="action-btn"
                                    onclick="editUser(${user.id})"
                                    title="Edit User"
                                >
                                    <i class="fa-solid fa-pen"></i>
                                </button>

                                <button
                                    class="action-btn delete-btn"
                                    onclick="deleteUser(${user.id})"
                                    title="Delete User"
                                >
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                              `
                        }

                    </td>

                </tr>
            `;
        });

    } catch (error) {

        console.error("Unexpected users error:", error);

        body.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:35px;">
                    Something went wrong while loading users.
                </td>
            </tr>
        `;
    }
}


/* =====================================================
   ADD USER
===================================================== */

const userForm = document.getElementById("userForm");

if (userForm) {

    userForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name =
            document.getElementById("userName").value.trim();

        const username =
            document.getElementById("username").value.trim();

        const role =
            document.getElementById("userRole").value;

        if (!name || !username) {
            alert("Please complete all required fields.");
            return;
        }

        try {

            console.log("Adding user...");
            console.log({
                name,
                username,
                role
            });

            const { error } = await supabaseClient
                .from("users")
                .insert({
                    name: name,
                    username: username,
                    role: role,
                    status: "Active"
                });

            if (error) {

                console.error("ADD USER ERROR:", error);

                if (error.code === "23505") {
                    alert("Username already exists.");
                } else {
                    alert(
                        "Failed to add user:\n\n" +
                        error.message
                    );
                }

                return;
            }

            // Clear form
            userForm.reset();

            // Close modal
            closeUserModal();

            // Refresh users table
            await renderUsers();

            alert("User successfully added!");

        } catch (error) {

            console.error(
                "Unexpected add user error:",
                error
            );

            alert(
                "Something went wrong:\n\n" +
                error.message
            );
        }

    });

}
/* =====================================================
   ADD USER MODAL CONTROLS
===================================================== */

const addUserBtn =
    document.getElementById("addUserBtn");

const userModal =
    document.getElementById("userModal");

const closeUserModalBtn =
    document.getElementById("closeUserModal");

const cancelUserBtn =
    document.getElementById("cancelUser");


function closeUserModal() {

    if (userModal) {
        userModal.classList.remove("show");
    }

}


if (addUserBtn) {

    addUserBtn.addEventListener("click", function() {

        if (userModal) {
            userModal.classList.add("show");
        }

    });

}


if (closeUserModalBtn) {

    closeUserModalBtn.addEventListener(
        "click",
        closeUserModal
    );

}


if (cancelUserBtn) {

    cancelUserBtn.addEventListener(
        "click",
        closeUserModal
    );

}


if (userModal) {

    userModal.addEventListener(
        "click",
        function(event) {

            if (event.target === this) {

                closeUserModal();

            }

        }
    );

}
// EDIT USER
// ==========================================

async function editUser(id) {

    try {

        const { data, error } = await supabaseClient
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {

            console.error("GET USER ERROR:", error);

            alert(
                "Failed to load user:\n\n" +
                error.message
            );

            return;
        }

        if (!data) {

            alert("User not found.");
            return;
        }

        document.getElementById("editUserId").value =
            data.id;

        document.getElementById("editUserName").value =
            data.name;

        document.getElementById("editUsername").value =
            data.username;

        document.getElementById("editUserRole").value =
            data.role;

        document.getElementById("editUserStatus").value =
            data.status;

        document.getElementById("editUserModal")
            .classList.add("show");

    } catch (error) {

        console.error("Unexpected edit user error:", error);

        alert(
            "Something went wrong:\n\n" +
            error.message
        );
    }
}

document.getElementById("editUserForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const id =
            Number(
                document.getElementById("editUserId")
                    .value
            );

        const name =
            document.getElementById("editUserName")
                .value
                .trim();

        const username =
            document.getElementById("editUsername")
                .value
                .trim();

        const role =
            document.getElementById("editUserRole")
                .value;

        const status =
            document.getElementById("editUserStatus")
                .value;

        if (!name || !username) {

            alert("Please complete all required fields.");
            return;
        }

        try {

            const { error } = await supabaseClient
                .from("users")
                .update({
                    name: name,
                    username: username,
                    role: role,
                    status: status
                })
                .eq("id", id);

            if (error) {

                console.error("UPDATE USER ERROR:", error);

                if (error.code === "23505") {

                    alert("Username already exists.");

                } else {

                    alert(
                        "Failed to update user:\n\n" +
                        error.message
                    );
                }

                return;
            }

            closeEditUserModal();

            await renderUsers();

            alert("User updated successfully!");

        } catch (error) {

            console.error(
                "Unexpected update user error:",
                error
            );

            alert(
                "Something went wrong:\n\n" +
                error.message
            );
        }

    });

    // ==========================================
// CLOSE EDIT USER MODAL
// ==========================================

function closeEditUserModal() {

    document.getElementById("editUserModal")
        .classList.remove("show");

}


document.getElementById("closeEditUserModal")
    .addEventListener(
        "click",
        closeEditUserModal
    );


document.getElementById("cancelEditUser")
    .addEventListener(
        "click",
        closeEditUserModal
    );


document.getElementById("editUserModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeEditUserModal();

        }

    });

// ==========================================
// DELETE USER
// ==========================================

async function deleteUser(id) {

    try {

        const { data, error } = await supabaseClient
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {

            console.error("GET USER ERROR:", error);

            alert(
                "Failed to find user:\n\n" +
                error.message
            );

            return;
        }

        if (!data) {

            alert("User not found.");
            return;
        }

        // Protect default admin
        if (
            data.username.toLowerCase() === "admin"
        ) {

            alert(
                "The default Administrator account " +
                "cannot be deleted."
            );

            return;
        }

        const confirmed = confirm(
            `Delete user "${data.name}"?\n\n` +
            "This action cannot be undone."
        );

        if (!confirmed) return;

        const { error: deleteError } =
            await supabaseClient
                .from("users")
                .delete()
                .eq("id", id);

        if (deleteError) {

            console.error(
                "DELETE USER ERROR:",
                deleteError
            );

            alert(
                "Failed to delete user:\n\n" +
                deleteError.message
            );

            return;
        }

        await renderUsers();

        alert("User deleted successfully!");

    } catch (error) {

        console.error(
            "Unexpected delete user error:",
            error
        );

        alert(
            "Something went wrong:\n\n" +
            error.message
        );
    }
}


/* =====================================================
   GLOBAL SEARCH
===================================================== */

const globalSearch =
    document.getElementById("globalSearch");


if (globalSearch) {

    globalSearch.addEventListener("input", function() {

        const value = this.value.trim();

        const activeSection =
            document.querySelector(".page-section.active");


        /* ==========================================
           USERS SEARCH
        ========================================== */

        if (
            activeSection &&
            activeSection.id === "usersSection"
        ) {

            renderUsers(value);

            return;
        }


        /* ==========================================
           INVENTORY SEARCH
        ========================================== */

        if (
            activeSection &&
            activeSection.id === "inventorySection"
        ) {

            renderInventory();

            return;
        }

    });

}


/* =====================================================
   MOBILE MENU
===================================================== */

document.getElementById("menuButton")
    .addEventListener("click", function() {

        document.getElementById("sidebar")
            .classList.toggle("show");

    });


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   INITIALIZE SYSTEM
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        // Supabase data is loaded by checkAuth()
        // after the user's session is verified.

    }
);
