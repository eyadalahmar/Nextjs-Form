'use client'
/*
* Author: Eyad
* Created: 2025/03/21 06:06:30
* Last modified: 2025/07/18 23:24:17
* Component: RegistrationForm
*/


import Head from "next/head";
import Form from 'next/form'
import styles from "@components/styles/Home.module.css";
import Nav from "@components/components/navbar/navbar";
import Footer from "@components/components/footer/footer";
import intlTelInput from 'intl-tel-input';
import "intl-tel-input/build/css/intlTelInput.css"
import React, { useState, useEffect, useRef, createElement } from "react";
import { Select, Space, ConfigProvider } from 'antd';
import axios from 'axios';
import "intl-tel-input/styles";
// // const myHeaders = new Headers();
// // myHeaders.append("Content-Type", "application/json");
// // myHeaders.append("X-API-Key", "");

export default function FormPage() {
  const [IntlTelInput, setIntlTelInput] = useState();
  const [formData, setFormData] = useState({
    fName: '',
    lName: '',
    country: '',
    phoneN: '',
    email: '',
    gender: '',
    selectedDegree: '',
    studyLanguage: '',
    selectedSpecialty: '',
    selectedUni: [],
    message: '',
  })


  const [initialFormData] = useState({
    ...formData
  })

  const [componentData, setComponentData] = useState({
    countriesNameList: {},
    listIsLoaded: false,
    languageIsEnabled: false,
    specialtyIsEnabled: false,
    selectedCountry: '',

  })
  const countriesCommonName = Object.keys(componentData.countriesNameList).sort()

  const [formDataError, setFormDataError] = useState({
    fNameErr: '',
    lNameErr: '',
    countryErr: '',
    phoneNErr: '',
    emailErr: '',
    genderErr: '',
    selectedDegreeErr: '',
    studyLanguageErr: '',
    selectedSpecialtyErr: '',
    selectedUniErr: '',

  })
  const [initialFormDataError] = useState({
    ...formDataError
  })

  const [serverSideError, setServerSideError] = useState('')
  const [infoSent, setInfoSent] = useState(false)

  const formEl = useRef()
  const phInputEl = useRef()

  const serverErrorStyle = {
    color: "#e53935",
    marginBlock: "1.5rem",
    maxWidth: "400px",
    marginInline: '2.5rem',
    backgroundColor: '#ffdddd',
    maxHeight: "400px",
    display: serverSideError ? 'block' : 'none',
    paddingInline: '1.2rem',
    paddingBlock: '0.5rem',
    borderInlineStart: '5px #e53935 solid'

  }

  const messageSentStyle = {
    color: "#43a047",
    marginInlineStart: 'inherit',
    marginBlock: "20px",
    maxWidth: "400px",
    marginInlineStart: '40px',
    backgroundColor: '#ddffdd',
    maxHeight: "400px",
    display: infoSent ? 'block' : 'none',
    paddingInline: '1.2rem',
    paddingBlock: '0.5rem',
    borderInlineStart: '5px #43a047 solid'

  }

  const calcHeight = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    // min-height + lines x line-height + padding + border
    let newHeight = 20 + numberOfLineBreaks * 20 + 14 + 4;
    return Math.min(500, Math.max(120, newHeight));
  }

  const handleFormChanges = (e) => {

    if (!e.target) {
      setFormData((prev) => ({
        ...prev,
        selectedUni: e
      })
      )
      if (formDataError.selectedUniErr !== '')
        setFormDataError((prev) => ({
          ...prev,
          selectedUniErr: '',
        })
        )

    }
    else {
      const { name, value } = e.target
     
      if((name==='fName'||name==='lName')&&value&&!/^[a-z ,.'-]+$/i.test(value)){
      setFormDataError((prev) => ({
            ...prev,
            [name + "Err"]: 'Please type English alphabet characters only (, - . \' are allowed)',
          }))
        return ;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value
      })
      )

      if (name != 'message') {
        if (formDataError[name + "Err"] !== '')
          setFormDataError((prev) => ({
            ...prev,
            [name + "Err"]: '',
          }))
      }
      if (!componentData.languageIsEnabled && name == "selectedDegree") {
        document.querySelector("#stlang").removeAttribute('disabled')
        setComponentData((prev) => ({
          ...prev,
          languageIsEnabled: true
        })
        )
      } else if (!componentData.specialtyIsEnabled && name == "studyLanguage") {
        document.querySelector("#specialty").removeAttribute('disabled')
        setComponentData((prev) => ({ ...prev, specialtyIsEnabled: true }))
      }

    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (infoSent)
      setInfoSent(false)
    if (serverSideError)
      setServerSideError(null)

    const errorEl = document.querySelector('#error-line')

    if (errorEl.textContent)
      errorEl.textContent = ''

    if (JSON.stringify(formData) !== JSON.stringify(initialFormData)) {
      const formErrors = {
        fNameErr: !formData.fName ? 'First name is required' : '',
        lNameErr: !formData.lName ? 'Last name is required' : '',
        countryErr: !formData.country ? 'Country of residence is required' : '',
        phoneNErr: !formData.phoneN ? 'Phone number is required' : phInputEl.current ? phInputEl.current.getInstance().isValidNumber() ? '' : 'Please Enter a valid number' : '',
        emailErr: !formData.email ? 'Email is required' : '',
        genderErr: !formData.gender ? 'Select your gender' : '',
        selectedDegreeErr: !formData.selectedDegree ? 'Degree is required' : '',
        studyLanguageErr: !formData.studyLanguage ? 'Study language is required' : '',
        selectedSpecialtyErr: !formData.selectedSpecialty ? 'Needed specialty is required' : '',
        selectedUniErr: formData.selectedUni.length == 0 ? 'Universities list is required' : '',
      }
      setFormDataError(formErrors)
      if (JSON.stringify(formErrors) === JSON.stringify(initialFormDataError)) {
        let data = {
          "firstName": formData.fName,
          "lastName": formData.lName,
          "email": formData.email,
          "phoneNumber": phInputEl.current ? phInputEl.current.getInstance().getNumber() : formData.phoneN,
          "password": "StrongP@ss12",
          "confirmPassword": "StrongP@ss12",
          "dateOfBirth": "1990-01-01",
          "citizenship": componentData.countriesNameList[formData.country] || 'n/a',
          "countryOfResidence": formData.country,
          "gender": formData.gender,
          "lang": formData.studyLanguage
        };


        try {
          const response = await axios.post('/api/PostAPI', data);
          console.log('IT WORKED', response);
          setInfoSent(true)
          resetForm()

        } catch (err) {
          setServerSideError((err.message + ' || ' + err.response.data.message) || 'A server error occurred');
        }


        //   let config = {
        //     method: 'post',
        //     maxBodyLength: Infinity,
        //     url: 'https://apiv2.unitededucation.com.tr/api/Auth/register',
        //     headers: { 
        //       'Accept': 'application/json',
        //       'Content-Type': 'application/json', 
        //       'X-API-Key': '',
        //     },
        //     data : data
        //   };
        //   (async()=>{
        //  await axios.request(config)
        //   .then((response) => {
        //     console.log(JSON.stringify(response.data));
        //   })
        //   .catch((error) => {

        //   });
        // })()

        // const requestOptions = {
        //   method: "POST",
        //   headers: myHeaders,
        //   body: data,
        //   redirect: "follow"
        // };

        // fetch("https://apiv2.unitededucation.com.tr/api/Auth/register", requestOptions)
        //   .then((response) => response.text())
        //   .then((result) => console.log(result))
        //   .catch((error) => console.error(error));

      }
      else {

        window.scrollTo({
          top: formEl.current?.getBoundingClientRect().top + document.documentElement.scrollTop - 400 | 800,
          left: 0,
          behavior: "smooth"
          ,
        })

      }
    }
    else {
      if (errorEl) {
        errorEl.textContent = "Please fill in your information"
        var errorElTop = errorEl.getBoundingClientRect().top + document.documentElement.scrollTop
        window.scrollTo({
          top: errorElTop ? errorElTop - 100 : 800,
          left: 0,
          behavior: "smooth",
        })
      }
      setFormDataError(initialFormDataError)
    }
  }
  const resetForm = () => {
    setFormData(initialFormData);
    setFormDataError(initialFormDataError)
    if (componentData.detectedCountry)
      phInputEl.current?.getInstance().setCountry(componentData.detectedCountry)
    setComponentData({
      countriesNameList: {},
      listIsLoaded: false,
      languageIsEnabled: false,
      specialtyIsEnabled: false,
      selectedCountry: '',
    })

    document.querySelector("#stlang").setAttribute('disabled', null)
    document.querySelector("#stlang > *").setAttribute('selected', null)
    document.querySelector("#specialty").setAttribute('disabled', null)
    document.querySelector("#specialty > *").setAttribute('selected', null)
    document.querySelector('#error-line').textContent = ''
  }
  useEffect(() => {
    if (componentData.selectedCountry)
      phInputEl.current?.getInstance().setCountry(componentData.selectedCountry)
    phInputEl.current?.getInstance().setNumber('')
  }, [componentData.selectedCountry])



  useEffect(() => {
    import("intl-tel-input/reactWithUtils").then((module) => {
      setIntlTelInput(() => module.default);
    });

    try {
      const countriesName = Object.fromEntries(
        intlTelInput.getCountryData().map(a => [a.name, a.iso2])
      );
      setComponentData((prev) => ({
        ...prev,
        countriesNameList: countriesName,
        listIsLoaded: true
      }))
    }
    catch {
      setComponentData((prev) => ({
        ...prev,
        countriesNameList: ["(Couldn't load)"],
      }))

    }

  }
    , [])


  return (
    <>
      <Head>
        <title>Registration form for private universities in Türkiye | United Education</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Nav />
      <header className={styles.header}>
        header
      </header>
      <div className={styles.imgArti}>
        <div className={styles.img}>img</div>
        <article className={styles.article}>
          <h2>Article</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
            sed do eiusmod tempos incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in '
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.</p>
        </article>
      </div>

      <div className={styles.form_area}>
        <div id="error-line" style={{
          color: "#e53935",
          margin: "0 0 0 45px",

        }}></div>
        <Form ref={formEl} onSubmit={handleFormSubmit}>
          <fieldset>
            <legend>Personal information</legend>
            <section>

              <label className="required" htmlFor="fname">First name:</label>
              <input
                id="fname"
                name="fName"
                autoComplete="given-name"
                type="text"
                placeholder="e.g. John"
                value={formData.fName}
                className={formDataError.fNameErr ? 'input-error' : null}
                onInput={handleFormChanges} />
              <span className={styles.error}>{formDataError.fNameErr}</span>
            </section>

            <section>

              <label className="required" htmlFor="lname">Last name:</label>
              <input
                id="lname"
                name="lName"
                autoComplete="family-name"
                type="text"
                placeholder="e.g. Ludosky"
                value={formData.lName}
                className={formDataError.lNameErr ? 'input-error' : null}
                onInput={handleFormChanges} />
              <span className={styles.error}>{formDataError.lNameErr}</span>
            </section>
            <section>

              <label className="required" htmlFor="country">Country of residence:</label>
              <input
                id="country"
                className={`${styles.country_in} ${formDataError.countryErr ? 'input-error' : null}`}
                name="country"
                type="text"
                list="countries"
                autoComplete="off"
                placeholder="Select or type to search"
                value={formData.country}
                onInput={handleFormChanges}
              />
              <datalist id="countries">
                {componentData.countriesNameList ?
                  componentData.listIsLoaded ?
                    countriesCommonName.map((a, b) =>
                      <option key={b} value={a}
                        onClick={() => {
                          setComponentData((prev) => (
                            {
                              ...prev,
                              selectedCountry: componentData.countriesNameList[a]
                            }))
                          setFormData((prev) => ({
                            ...prev,
                            country: a
                          }))
                        }}
                        className={styles.option}>
                        {a}
                      </option>)
                    : <><option value="N/A" disabled>Couldn't load countries list.</option>
                      <option value="N/A" disabled>Please type it manually</option></>

                  : <option value="loading" disabled>Loading countries list..</option>
                }
              </datalist>
              <span className={styles.error}>{formDataError.countryErr}</span>
            </section>

            <section>
              <label className="required" htmlFor="phone">Phone number:</label>
              {IntlTelInput ? <IntlTelInput
                ref={phInputEl}
                inputProps={
                  { id:'phone',
                    ['name']: 'phoneN',
                    className: `${styles.phone_in} ${formDataError.phoneNErr ? 'input-error' : null}`,
                    onInput: handleFormChanges,
                    value: FormData.phoneN,
                  }
                }
                initOptions={{
                  countrySearch: true,
                  customPlaceholder: selectedCountryPlaceholder => selectedCountryPlaceholder,

                  excludeCountries: ["il"],
                  geoIpLookup: function (callback) {
                    fetch("https://ipapi.co/json")
                      .then(function (res) { return res.json(); })
                      .then(function (data) {
                        callback(data.country_code);
                        setComponentData(prev => ({
                          ...prev,
                          detectedCountry: data.country_code
                        }))
                      })
                      .catch(function () { callback(); });
                  },
                  initialCountry: 'auto',

                  placeholderNumberType: "MOBILE",
                  useFullscreenPopup: false,
                }}
              /> :
                <input
                  placeholder="Type manually with +country code e.g. +11234567890"
                  name='phoneN'
                  id='phone'
                  className={`${styles.phone_in} ${formDataError.phoneNErr ? 'input-error' : null}`}
                  onInput={handleFormChanges}
                  value={FormData.phoneN}
                />
              }

              <span className={styles.error}>{formDataError.phoneNErr}</span>
            </section>
            <section>
              <label className="required" htmlFor="email">Email:</label>
              <input
                name="email"
                id="email"
                type="email"
                value={formData.email}
                placeholder="example@mail.com"
                className={formDataError.emailErr ? 'input-error' : null}
                onInput={handleFormChanges}
              />
              <span className={styles.error}>{formDataError.emailErr}</span>
            </section>

            <section>
              <label className="required">Gender:</label>
              <div className={styles.gender_box}
                style={formDataError.genderErr ? { borderColor: '#e53935' } : {}}
              >

                <label className="gender-label" htmlFor="male">
                  <input
                  id='male'
                    name="gender"
                    type="radio"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleFormChanges}
                  />
                  Male
                </label>
                <label className="gender-label" htmlFor="female">
                  <input
                  id="female"
                    name="gender"
                    type="radio"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleFormChanges}
                  />
                  Female
                </label>
              </div>
              <span className={styles.error}>{formDataError.genderErr}</span>
            </section>
          </fieldset>
          <fieldset>

            <section>
              <legend>Specialization and university information</legend>
              <label className="required" htmlFor="degree">
                Select the degree you want:
              </label>
              <select
              id='degree'
                name="selectedDegree"
                value={formData.selectedDegree}
                onChange={handleFormChanges}
                className={formDataError.selectedDegreeErr ? 'input-error' : null}
              >
                <option value='' selected disabled>--select one--</option>
                <option value="Associated">Associated Degree</option>
                <option value="Bachelor">Bachelor Degree</option>
                <option value="Master">Master With Thesis Degree</option>
                <option value="PHD">PHD</option>
                <option value="MWT">Master Without Thesis Degree</option>
                <option value="MO">Master Online Degree</option>
              </select>
              <span className={styles.error}>{formDataError.selectedDegreeErr}

              </span>
            </section>
            <section>

              <label className="required" htmlFor="stlang">
                Select the study language you prefer:
              </label>
              <select name="studyLanguage"

                id="stlang"
                disabled
                value={formData.studyLanguage}
                className={formDataError.studyLanguageErr ? 'input-error' : null}
                onChange={handleFormChanges}>
                <option value='' selected disabled>{formData.selectedDegree ?
                  "--Select one--" :
                  "(Select a degree first)"}</option>
                {formData.selectedDegree && (
                  <><option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="ru">Russian</option>
                    <option value="fr">French</option>
                    <option value="tr_en">English And Turkish</option>
                    <option value="ar">Arabic</option>
                    <option value="ge">German</option>
                    <option value="ch">Chinese</option>
                    <option value="other">Other language</option></>)}
              </select>
              <span className={styles.error}>{formDataError.studyLanguageErr}</span>
            </section>

            <section>

              <label className="required" htmlFor="specialty">Select the specialty that suits you:</label>
              <select name="selectedSpecialty" id="specialty" value={formData.selectedSpecialty}
                onChange={handleFormChanges}
                disabled
                className={formDataError.selectedSpecialtyErr ? 'input-error' : null}
              >
                <option value='' selected disabled>
                  {formData.selectedDegree ? formData.studyLanguage ? "--Select one--" : "(Select a study language first)" : "(Select a degree & language first)"}
                </option>
                {formData.selectedDegree && formData.studyLanguage && (<>
                  <option value="1">Accounting and Taxation </option>
                  <option value="2">Anesthesia </option>
                  <option value="3">Applied English and Translation </option>
                  <option value="4">Applied English and Translation (Evening Program)</option>
                  <option value="5">Applied English Translation </option>
                  <option value="6">Audiometry </option>
                  <option value="7">Business Administration </option>
                  <option value="8">Business Management </option>
                  <option value="9">Child Development </option>
                  <option value="10">Civil Air Transportation Management </option>
                  <option value="11">Civil Air Transportation Management (Evening Program)</option>
                  <option value="12">Civil Aviation Cabin Services </option>
                  <option value="13">Civil Aviation Management </option>
                  <option value="14">Civil Aviation Transportation Management </option>
                  <option value="15">Computer Programming </option>
                  <option value="16">Computer Programming and Information Technology </option>
                  <option value="17">Cookery </option>
                  <option value="18">Dental Prosthetics Technology </option>
                  <option value="19">Dialysis </option>
                  <option value="20">Elderly Care </option>
                  <option value="21">First Aid and Emergency </option>
                  <option value="22">First and Emergency Aid </option>
                  <option value="23">Foreign Trade </option>
                  <option value="24">Graphic Design </option>
                  <option value="25">International Trade </option>
                  <option value="26">Justice </option>
                  <option value="27">Maritime Management and Operations </option>
                  <option value="28">Maritime Transportation Management </option>
                  <option value="29">Medical Imaging Techniques </option>
                  <option value="30">Medical Laboratory Techniques </option>
                  <option value="31">Occupational Health and Safety </option>
                  <option value="32">Operation Room Services </option>
                  <option value="33">Optician </option>
                  <option value="34">Pharmacy Services </option>
                  <option value="35">Physiotherapy </option>
                  <option value="36">Public Relations and Advertising </option>
                  <option value="37">Ship Machinery </option>
                </>
                )}
              </select>
              <span className={styles.error}>{formDataError.selectedSpecialtyErr}</span>
            </section>

            <section>
              <label className="required" htmlFor="uni">Select universities you want to apply to:</label>
              <ConfigProvider
                theme={{
                  components: {
                    Select: {
                      activeBorderColor: "#1967d2",
                      fontSize: 12.9,

                      multipleItemHeight: 32
                    },
                  },
                  token: {
                    borderRadius: 20,
                  }
                }}
              >
                <Space
                  className={styles.multi_select}
                  style={{
                    width: "100%",
                    appearance: "none"

                  }}
                  direction="vertical"

                >
                  <Select
                  id='uni'
                    status={formDataError.selectedUniErr ? 'error' : ''}
                    name="selectedUni"
                    mode="multiple"
                    allowClear
                    style={{
                      width: "100%",
                      height: '100%',
                      appearance: "none",
                    }}
                    placeholder="--Multiple selection--"
                    value={formData.selectedUni}
                    onChange={handleFormChanges}
                    options={[
                      "Ankara Medipol University",
                      "Ankara Science University",
                      "Atılım University",
                      "Bahceşehir Cyprus University",
                      "Bahçeşehir University",
                      "Beykent University",
                      "Beykoz University",
                      "Bilkent University",
                      "Biruni University",
                      "Cyprus Health and Social Sciences University",
                      "Cyprus Science University",
                      "Cyprus West University",
                      "Doğuş University",
                      "Eastern Mediterranean University",
                      "Esenyurt University",
                      "Fatih Sultan Mehmet University",
                      "Fenerbahçe University",
                      "Haliç University",
                      "Hasan Kalyoncu University",
                      "Işık University",
                      "Istanbul Altınbaş University",
                      "Istanbul Arel University",
                      "Istanbul Atlas University",
                      "Istanbul Aydın University",
                      "Istanbul Bilgi University",
                      "Istanbul Commerce University",
                      "Istanbul Gedik University",
                      "Istanbul Gelişim University",
                      "İstanbul Kent University",
                      "Istanbul Kültür University",
                      "Istanbul Medipol University",
                      "Istanbul Okan University",
                      "Istanbul Sabahttin Zaim University",
                      "Istanbul Şehir University (Currently closed)",
                      "Istanbul Topkapı University",
                      "Istinye University",
                      "Kadir Has University",
                      "Koç University",
                      "Konya Food and Agriculture University",
                      "kyrenia University",
                      "Lokman Hekim University",
                      "Maltepe University",
                      "Near East University",
                      "Nişantaşı University",
                      "Ostim Technical University",
                      "Özyeğin University",
                      "Sabanci University",
                      "Show ali universities",
                      "TED University",
                      "Toros University",
                      "Turkish Aeronautical Association University",
                      "Üsküdar University",
                      "Yaşar University",
                      "Yeditepe University",
                      "Yeni Yuzyil University",
                    ].map(a => ({
                      label: a,
                      value: a
                    })
                    )}
                  />
                </Space>
              </ConfigProvider>
              <span className={styles.error}>{formDataError.selectedUniErr}</span>
            </section>
            <section>

              <label className="optional" htmlFor="message">Message:</label>
              <textarea
              id="message"
                name="message"
                value={formData.message}
                onChange={handleFormChanges}
                placeholder="Please clarify special requests, if any."
                style={{
                  height: calcHeight(formData.message) + "px",
                }} />
            </section>
          </fieldset>
          <section>
            <button type="reset" className="reset-button" onClick={resetForm}>Clear form</button>
            <p className="required_guide">=required</p>
            <article style={{ textAlign: 'center', margin: "0 9%", lineHeight: "1.4em" }}>
              If you encounter any problem filling out the university
              registration form, please email us:
              <a style={{
                display: "block",
                color: "#f1d013",
                margin: "1rem"
              }} href="mailto:info@unitededucation.com.tr">
                info@unitededucation.com.tr</a>
            </article>
          </section>
          <button type="submit">Send now
            {/* 
              <svg style={arrowStyle} version="1.1" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path d="M627.498667 240.469333l241.365333 241.365334a42.666667 42.666667 0 0 1 0 60.330666l-241.365333 241.365334a42.666667 42.666667 0 0 1-60.330667-60.330667l168.533333-168.533333H170.666667a42.666667 42.666667 0 1 1 0-85.333334h565.034666l-168.533333-168.533333a42.666667 42.666667 0 1 1 60.330667-60.330667z" /></svg>
 */}</button>
        </Form>
        <div style={serverErrorStyle}>
          <h2 style={{
            marginBlock: "0.2rem",
            fontWeight: 'bolder',
            fontSize: "1.4em",
            color: '#d51915'
          }}>Server error:</h2>
          <p>[ {serverSideError} ]</p>
          If the problem is not from your side, please wait for a while,
          or report the problem to us!
          <a href={`mailto:info@unitededucation.com.tr?subject=SERVER%20ERROR%20REPORT&body=Hello%2C%0AI%20got%20this%20error%20from%20the%20server%20while%20attempting%20to%20submit%20my%20information%20at%20unitededucation.com%2Fen%2Fpreregister%20%3A%0A%0A${encodeURI(serverSideError)}`}>
            info@unitededucation.com.tr
          </a>
        </div>

        <div style={messageSentStyle}>
          <h2 style={{
            marginBlock: "0.2rem",
            fontWeight: 'bolder',
            fontSize: "1.4em",
            color: '#199515'
          }}>Information sent!</h2>
          One of our team will review your inquiry and reach out to you soon.</div>
      </div>
      <Footer />
    </>
  );
}
