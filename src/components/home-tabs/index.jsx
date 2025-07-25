"use client"
import React, { useEffect ,useState} from 'react'
import './homeTabs.css'
import HeadingBar from '../common/heading-bar'


const HomeTabs = () => {
    useEffect(() => {
        const $ = document.querySelector.bind(document)
        const $$ = document.querySelectorAll.bind(document)
    
        // Tab-underline logic
        const tabs = $$(".tab-item")
        const panes = $$(".tab-pane")
        const tabActive = $(".tab-item.active")
        const line = $(".tabs .line")
    
        requestIdleCallback(() => {
          line.style.left = `${tabActive.offsetLeft}px`
          line.style.width = `${tabActive.offsetWidth}px`
        })
    
        tabs.forEach((tab, index) => {
          const pane = panes[index]
          tab.addEventListener("click", () => {
            $(".tab-item.active").classList.remove("active")
            $(".tab-pane.active").classList.remove("active")
    
            line.style.left = `${tab.offsetLeft}px`
            line.style.width = `${tab.offsetWidth}px`
    
            tab.classList.add("active")
            pane.classList.add("active")
    
            const currentPane = document.querySelector(".tab-pane.active")
            const newPane = panes[index]
    
            // Slide out current image
            const img = currentPane.querySelector(".right-inner-tab img")
            img.style.transform = "translateX(100%)"
            img.style.opacity = "0"
    
            setTimeout(() => {
              currentPane.classList.remove("active")
              newPane.classList.add("active")
    
              // Slide in the new image
              const newImg = newPane.querySelector(".right-inner-tab img")
              newImg.style.transform = "translateX(0)"
              newImg.style.opacity = "1"
            }, 100)
          })
        })
    
        // Pie-chart logic
        const tabData = [
          { percent: 83, description: "απομνημόνευση ονόματος", color: "#6732b7" },
          { percent: 31, description: "λιγότερες αποχωρήσεις", color: "#ff8900" },
          { percent: 43, description: "πιθανότητα επανασυνεργασίας", color: "#016cbb" },
          { percent: 76, description: "θετική γνώμη επωνυμίας", color: "#c54e4f" },
          { percent: 71, description: "αυξημένη προβολή", color: "#50b73f" },
          { percent: 85, description: "ανάμνηση δώρου", color: "#ffc142" },
        ]
    
        let lastPercent = 0
    
        function animatePieChart(pieEl, startP, endP, color) {
          const startOffset = (startP / 100) * 40
          const endOffset = (endP / 100) * 40
    
          pieEl.style.strokeDasharray = `${startOffset}, 100`
          pieEl.style.stroke = color
    
          let startTime = null
          const duration = 500
    
          function step(ts) {
            if (!startTime) startTime = ts
            const progress = Math.min((ts - startTime) / duration, 1)
            const curr = startOffset + (endOffset - startOffset) * progress
            pieEl.style.strokeDasharray = `${curr}, 100`
            if (progress < 1) {
              requestAnimationFrame(step)
            } else {
              lastPercent = endP
            }
          }
    
          requestAnimationFrame(() => requestAnimationFrame(step))
        }
    
        // init first
        const initialPie = panes[0].querySelector(".circle")
        const percentTxt = panes[0].querySelector("#percentage")
        const descTxt = panes[0].querySelector("#percentage-description")
        animatePieChart(initialPie, 0, tabData[0].percent, tabData[0].color)
        percentTxt.textContent = tabData[0].percent
        descTxt.textContent = tabData[0].description
    
        // update on click
        tabs.forEach((tab, idx) => {
          tab.addEventListener("click", () => {
            const pie = panes[idx].querySelector(".circle")
            const pTxt = panes[idx].querySelector("#percentage")
            const dTxt = panes[idx].querySelector("#percentage-description")
    
            animatePieChart(pie, lastPercent, tabData[idx].percent, tabData[idx].color)
            pTxt.textContent = tabData[idx].percent
            dTxt.textContent = tabData[idx].description
          })
        })
    }, [])
    const headingBarData = {
        title: "Logo-printed promotional gifts and merchandising",
        description:'Our range of personalised options ensures your corporate identity stands out. Whether you are looking for promotional products for events or unique gifts for business partners and employees, we have the solution to suit your needs.',
        line: true,
        fullWidth: true,
    }

    return (
        <div className='bg-[#f8f8f8] py-12'>
            <HeadingBar data={headingBarData} />
            <div className="featured-tabs">
                {/* Tab items */}
                <div className="tabs">
                    <div className="tab-item active">Brand</div>
                    <div className="tab-item">Αφοσίωση</div>
                    <div className="tab-item">Μέριμνα</div>
                    <div className="tab-item">Καινοτομία</div>
                    <div className="tab-item">Social media</div>
                    <div className="tab-item">Events</div>
                    <div className="line" />
                </div>
                {/* Tab content */}
                <div className="tab-content">
                    <div className="tab-pane active">
                        <div className="tabs-inner">
                            <div className="left-inner-tab">
                                <h2>Οι πελάτες θυμούνται περισσότερο την επωνυμία σας </h2>
                                <p>Οι επιχειρήσεις που προσφέρουν εταιρικά δώρα έχουν 40% περισσότερες πιθανότητες να μείνουν αξέχαστες στους πελάτες τους.</p>
                                <p>Μια μελέτη έδειξε ότι το 83% των καταναλωτών θυμούνται το όνομα της εταιρείας από την οποία έλαβαν ένα διαφημιστικό δώρο, ακόμα και δύο χρόνια μετά.</p>
                                <p>Το λογότυπό σας πάνω σε ένα εταιρικό δώρο μπορεί να αφήσει μακροχρόνια εντύπωση στους πελάτες.</p>
                                <p>Εύκολος τρόπος για τους πελάτες σας να αναγνωρίσουν την εταιρεία σας και να συνδεθούν μαζί της στο μέλλον.</p>
                            </div>
                            <div className="right-inner-tab">
                                <img decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/brand.jpg" />
                                <img className="circle_bg" decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/circle_bg2.png" />
                                <div className="pie-container">
                                    <svg viewBox="0 0 36 36" className="pie-chart">
                                        {/* Static light background circle with around 40% coverage */}
                                        <path className="circle-bg" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                        {/* Dynamic colored circle for percentage with rounded ends */}
                                        <path className="circle" strokeDasharray="0, 50" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                    </svg>
                                    <div className="percentage-text">
                                        <span id="percentage">0</span>%
                                        <p id="percentage-description">Description</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane">
                        <div className="tabs-inner">
                            <div className="left-inner-tab">
                                <h2>Ενίσχυση της αφοσίωσης και της εταιρικής κουλτούρας</h2>
                                <p>Η παροχή εταιρικών  Well come kit ή διαφημιστικών δώρων στους υπαλλήλους ενισχύει την κουλτούρα της εταιρείας  και τους κάνει να νιώθουν πιο δεμένοι με τους συνάδελφους και την εταιρεία.</p>
                                <p>Εταιρείες που έχουν πιο ισχυρή κουλτούρα έχουν 31% λιγότερες αποχωρήσεις προσωπικού, σύμφωνα με έρευνα της <a href="https://www2.deloitte.com/us/en/blog/human-capital-blog/2023/future-of-total-rewards.html" target="_blank" style={{ color: '#50b73f', fontWeight: 600 }}>Deloitte</a>.</p>
                                <p>Τα εταιρικά δώρα αυτά κάνουν τους υπαλλήλους να νιώθουν ότι τους εκτιμούν , ενισχύοντας την αφοσίωση, την παραγωγηκότητα και την εμπλοκή τους στη δουλειά.</p>
                            </div>
                            <div className="right-inner-tab">
                                <img decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/afosiosi.jpg" />
                                <img className="circle_bg" decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/circle_bg2.png" />
                                <div className="pie-container">
                                    <svg viewBox="0 0 36 36" className="pie-chart">
                                        {/* Static light background circle with around 40% coverage */}
                                        <path className="circle-bg" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                        {/* Dynamic colored circle for percentage with rounded ends */}
                                        <path className="circle" strokeDasharray="0, 50" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                    </svg>
                                    <div className="percentage-text">
                                        <span id="percentage">0</span>%
                                        <p id="percentage-description">Description</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane">
                        <div className="tabs-inner">
                            <div className="left-inner-tab">
                                <h2>Δείξτε ότι νοιάζεστε τους πελάτες σας</h2>
                                <p>Η παροχή εταιρικών δώρων στους πελάτες μπορεί να βελτιώσει τις επαγγελματικές σας σχέσεις.</p>
                                <p>Το 43% των πελατών είναι πιο πιθανό να συνεργαστούν ξανά μαζί σας μόλις αποκτήσουν ένα εταιρικό δώρο απο εσάς, σύμφωνα με έρευνες.</p>
                                <p>Τα εταιρικά δώρα δείχνουν ότι νοιάζεστε και εκτιμάτε τους πελάτες σας.</p>
                                <p>Αυτή η προσοχή μπορεί να αυξήσει την ικανοποίηση και την αφοσίωση των πελατών, οδηγώντας σε περισσότερες επαναλαμβανόμενες πωλήσεις.</p>
                            </div>
                            <div className="right-inner-tab">
                                <img decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/merimna.jpg" />
                                <img className="circle_bg" decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/circle_bg2.png" />
                                <div className="pie-container">
                                    <svg viewBox="0 0 36 36" className="pie-chart">
                                        {/* Static light background circle with around 40% coverage */}
                                        <path className="circle-bg" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                        {/* Dynamic colored circle for percentage with rounded ends */}
                                        <path className="circle" strokeDasharray="0, 50" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                    </svg>
                                    <div className="percentage-text">
                                        <span id="percentage">0</span>%
                                        <p id="percentage-description">Description</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane">
                        <div className="tabs-inner">
                            <div className="left-inner-tab">
                                <h2>Ξεχωρίστε από τους ανταγωνιστές και φτάστε στην κορυφή</h2>
                                <p>Τα επιχειρηματικά δώρα είναι ένας αποτελεσματικός τρόπος να αυξήσετε την αναγνωρισιμότητα της επιχείρησής σας.</p>
                                <p>Έρευνες δείχνουν ότι το 76% των ανθρώπων που λαμβάνουν εταιρικά δώρα έχουν πιο θετική γνώμη για την επωνυμία.</p>
                                <p>Με εκτυπωμένα με το λογοτυπο σας προϊόντα, μπορείτε να δημιουργήσετε αξέχαστες εμπειρίες για τους πελάτες σας.</p>
                                <p>Τα εταιρικά δώρα σας βοηθούν να ξεχωρίσετε από τους ανταγωνιστές και να δημιουργήσετε θετική εικόνα για την επωνυμία σας στην αγορά.</p>
                            </div>
                            <div className="right-inner-tab">
                                <img decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/kainotomia.jpg" />
                                <img className="circle_bg" decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/circle_bg2.png" />
                                <div className="pie-container">
                                    <svg viewBox="0 0 36 36" className="pie-chart">
                                        {/* Static light background circle with around 40% coverage */}
                                        <path className="circle-bg" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                        {/* Dynamic colored circle for percentage with rounded ends */}
                                        <path className="circle" strokeDasharray="0, 50" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                    </svg>
                                    <div className="percentage-text">
                                        <span id="percentage">0</span>%
                                        <p id="percentage-description">Description</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane">
                        <div className="tabs-inner">
                            <div className="left-inner-tab">
                                <h2>Εταιρικά δώρα και Social media</h2>
                                <p>Τα προωθητικα δώρα μπορουν να αυξήσουν την αλληλεπίδραση της εταιρείας σας στα social media.</p>
                                <p>Ενθαρρύνετε τους πελάτες να μοιραστούν φωτογραφίες των διαφημιστικών δώρων τους διαδικτυακά.</p>
                                <p>Το 71% των marketers πιστεύουν ότι οι δημοσιεύσεις στα social media αυξάνουν σημαντικά την προβολή της επωνυμίας.</p>
                                <p>Όταν οι πελάτες δημοσιεύουν τα εταρικά προϊόντα που λαμβάνουν, προωθούν την επωνυμία σας με φυσικό τρόπο.</p>
                                <p>Καμπάνια όπου οι πελάτες μοιράζονται φωτογραφίες των δώρων τους με το hashtag της επωνυμίας σας μπορεί να δημιουργήσει viral αποτέλεσμα και να αυξήσει την ορατότητα της επιχείρησής σας.</p>
                            </div>
                            <div className="right-inner-tab">
                                <img decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/social.jpg" />
                                <img className="circle_bg" decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/circle_bg2.png" />
                                <div className="pie-container">
                                    <svg viewBox="0 0 36 36" className="pie-chart">
                                        {/* Static light background circle with around 40% coverage */}
                                        <path className="circle-bg" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                        {/* Dynamic colored circle for percentage with rounded ends */}
                                        <path className="circle" strokeDasharray="0, 50" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                    </svg>
                                    <div className="percentage-text">
                                        <span id="percentage">0</span>%
                                        <p id="percentage-description">Description</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane">
                        <div className="tabs-inner">
                            <div className="left-inner-tab">
                                <h2>Εταρικά events και εκθέσεις</h2>
                                <p>Τα διαφημιστικά μπορούν να κάνουν την επωνυμία σας να ξεχωρίσει σε πολυσύχναστες εμπορικές εκθέσεις.</p>
                                <p>Έρευνες δείχνουν ότι το 85% των επισκεπτών εκθέσεων θυμούνται την εταιρεία που τους έδωσε ένα καινοτόμο διαφημιστικό δώρο με λογότυπο .</p>
                                <p>Προσφέροντας ένα μοναδικό και εταιρικό προϊόν, εξασφαλίζετε ότι το περίπτερό σας και η επωνυμία σας θα μείνουν αξέχαστα μετά το τέλος της εκδήλωσης.</p>
                                <p>Χρησιμοποιήστε συνεδριακές τσάντες με το λογότυπό σας ή λογοτυπημένα σημειωματάρια, είναι χρήσιμα δώρα που οι επισκέπτες θα κρατήσουν, βοηθώντας την επωνυμία σας να παραμείνει στο μυαλό τους.</p>
                            </div>
                            <div className="right-inner-tab">
                                <img decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/events.jpg" />
                                <img className="circle_bg" decoding="async" src="https://funpromotion.gr/wp-content/uploads/logos/2024/10/circle_bg2.png" />
                                <div className="pie-container">
                                    <svg viewBox="0 0 36 36" className="pie-chart">
                                        {/* Static light background circle with around 40% coverage */}
                                        <path className="circle-bg" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                        {/* Dynamic colored circle for percentage with rounded ends */}
                                        <path className="circle" strokeDasharray="0, 50" d="M18 18 m-15.9155,0 a 15.9155 15.9155 0 1 1 31.831 0" />
                                    </svg>
                                    <div className="percentage-text">
                                        <span id="percentage">0</span>%
                                        <p id="percentage-description">Description</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default HomeTabs
