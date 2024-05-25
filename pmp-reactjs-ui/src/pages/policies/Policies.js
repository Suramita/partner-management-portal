import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPartnerManagerUrl, formatDate, handleServiceErrors } from '../../utils/AppUtils';
import { HttpService } from '../../services/HttpService';
import PoliciesFilter from './PoliciesFilter';
import ReactPaginate from 'react-paginate';
import ErrorMessage from '../common/ErrorMessage';
import LoadingIcon from "../common/LoadingIcon";
import Footer from "../common/Footer";

import rectangleGrid from '../../svg/rectangle_grid.svg';
import sortIcon from '../../svg/sort_icon.svg';
import backArrow from '../../svg/back_arrow.svg';

function Policies() {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const [firstTimeLoad, setFirstTimeLoad] = useState(false);
  const [filter, setFilter] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [policiesList, setPoliciesList] = useState([]);
  const [filteredPoliciesList, setFilteredPoliciesList] = useState([]);
  const [order, setOrder] = useState("ASC");
  const [firstIndex, setFirstIndex] = useState(0);
  const [selectedRecordsPerPage, setSelectedRecordsPerPage] = useState(5);
  const [previous, setPrevious] = useState(false);
  const [next, setNext] = useState(false);
  const [isDescending, setIsDescending] = useState(true);
  const itemsPerPageOptions = [5, 10, 15, 20];
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);
  const [viewPolicyId, setViewPolicyId] = useState(-1);
  const defaultFilterQuery = {
    partnerId: "",
    policyGroup: ""
  };
  const [filterQuery, setFilterQuery] = useState({ ...defaultFilterQuery });

  const tableHeaders = [
    { id: "partnerId", headerNameKey: 'policies.partnerId' },
    { id: "partnerType", headerNameKey: "policies.partnerType" },
    { id: "policyGroup", headerNameKey: "policies.policyGroup" },
    { id: "policyName", headerNameKey: "policies.policyName" },
    { id: "createDate", headerNameKey: "policies.createdDate" },
    { id: "status", headerNameKey: "policies.status" },
    { id: "action", headerNameKey: 'policies.action' }
  ];

  const tableValues = [
    { "partnerId": "P10001", "partnerType": "Authentication", "policyGroup": "Policy Group Name1", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10002", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name2", "policyName": "KYC", "createDate": "2024-05-21T03:11:42.422+00:00", "status": "Rejected", "Action": "..." },
    { "partnerId": "P10003", "partnerType": "Authentication", "policyGroup": "Policy Group Name3", "policyName": "Full KYC", "createDate": "2024-05-21T02:16:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10004", "partnerType": "Authentication", "policyGroup": "Policy Group Name4", "policyName": "Full KYC", "createDate": "2024-05-21T02:14:42.422+00:00", "status": "Pending for Approval", "Action": "..." },
    { "partnerId": "P10005", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name5", "policyName": "KYC", "createDate": "2024-05-21T02:13:42.422+00:00", "status": "Deactivated", "Action": "..." },
    { "partnerId": "P10006", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name6", "policyName": "KYC1", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10007", "partnerType": "Authentication", "policyGroup": "Policy Group Name7", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10008", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name8", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Rejected", "Action": "..." },
    { "partnerId": "P10009", "partnerType": "Authentication", "policyGroup": "Policy Group Name9", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10010", "partnerType": "Authentication", "policyGroup": "Policy Group Name10", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10011", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name11", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Rejected", "Action": "..." },
    { "partnerId": "P10012", "partnerType": "Authentication", "policyGroup": "Policy Group Name11", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10013", "partnerType": "Authentication", "policyGroup": "Policy Group Name11", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Pending for Approval", "Action": "..." },
    { "partnerId": "P10014", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name12", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Deactivated", "Action": "..." },
    { "partnerId": "P10015", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name12", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10016", "partnerType": "Authentication", "policyGroup": "Policy Group Name10", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10017", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name13", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Rejected", "Action": "..." },
    { "partnerId": "P10018", "partnerType": "Authentication", "policyGroup": "Policy Group Name14", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10019", "partnerType": "Authentication", "policyGroup": "Policy Group Name16", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10020", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name16", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Rejected", "Action": "..." },
    { "partnerId": "P10021", "partnerType": "Authentication", "policyGroup": "Policy Group Name17", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10022", "partnerType": "Authentication", "policyGroup": "Policy Group Name14", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Pending for Approval", "Action": "..." },
    { "partnerId": "P10023", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name2", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Deactivated", "Action": "..." },
    { "partnerId": "P10024", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name1", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10025", "partnerType": "Authentication", "policyGroup": "Policy Group Name18", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10026", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name19", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Rejected", "Action": "..." },
    { "partnerId": "P10027", "partnerType": "Authentication", "policyGroup": "Policy Group Name20", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10028", "partnerType": "Authentication", "policyGroup": "Policy Group Name21", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10029", "partnerType": "MISP Partner", "policyGroup": "Policy Group Name22", "policyName": "KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Rejected", "Action": "..." },
    { "partnerId": "P10030", "partnerType": "Authentication", "policyGroup": "Policy Group Name23", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Approved", "Action": "..." },
    { "partnerId": "P10031", "partnerType": "Authentication", "policyGroup": "Policy Group Name24", "policyName": "Full KYC", "createDate": "2024-05-21T02:11:42.422+00:00", "status": "Pending for Approval", "Action": "..." }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoaded(false);
        const response = await HttpService.get(getPartnerManagerUrl('/partners/getAllPolicies', process.env.NODE_ENV));
        setFirstTimeLoad(true);
        if (response) {
          const responseData = response.data;
          if (responseData && responseData.response) {
            const resData = responseData.response;
            const sortedData = resData.sort((a, b) => new Date(b.createDate) - new Date(a.createDate));
            //adding hardcoded data
            setPoliciesList(tableValues);
            setFilteredPoliciesList(policiesList);
            //console.log('Response data:', policiesList.length);
          } else {
            handleServiceErrors(responseData, setErrorCode, setErrorMsg);
          }
        } else {
          setErrorMsg(t('policies.errorInPoliciesList'));
        }
        setDataLoaded(true);
      } catch (err) {
        console.error('Error fetching data:', err);
        setErrorMsg(err);
      }
    };
    fetchData();
  }, [firstTimeLoad]);

  const moveToHome = () => {
    navigate('/partnermanagement')
  };

  const showViewPolicyDetails = (id) => {
    navigate('/partnermanagement/viewPolicyDetails')
  };

  const cancelErrorMsg = () => {
    setErrorMsg("");
  };

  function bgOfStatus(status) {
    if (status === "Approved") {
      return ("bg-[#D1FADF] text-[#155E3E]")
    }
    else if (status === "Rejected") {
      return ("bg-[#FAD6D1] text-[#5E1515]")
    }
    else if (status === "Pending for Approval") {
      return ("bg-[#FEF1C6] text-[#6D1C00]")
    }
    else if (status === "Deactivated") {
      return ("bg-[#EAECF0] text-[#525252]")
    }
  }

  //This part is related to Sorting
  const toggleSortOrder = (sortItem) => {
    if (order === 'ASC') {
      if (sortItem === "createDate") {
        const sortedPolicies = [...filteredPoliciesList].sort((a, b) => {
          const dateA = new Date(a.createDate);
          const dateB = new Date(b.createDate);
          return isDescending ? dateA - dateB : dateB - dateA;
        });
        setFilteredPoliciesList(sortedPolicies);
        setIsDescending(!isDescending);
      }
      else {
        const sortedPolicies = [...filteredPoliciesList].sort((a, b) =>
          a[sortItem].toLowerCase() > b[sortItem].toLowerCase() ? 1 : -1
        );
        setFilteredPoliciesList(sortedPolicies);
        setOrder("DESC")
      }
    }
    if (order === 'DESC') {
      if (sortItem === "createDate") {
        const sortedPolicies = [...filteredPoliciesList].sort((a, b) => {
          const dateA = new Date(a.createDate);
          const dateB = new Date(b.createDate);
          return isDescending ? dateA - dateB : dateB - dateA;
        });

        setFilteredPoliciesList(sortedPolicies);
        setIsDescending(!isDescending);
      }
      else {
        const sortedPolicies = [...filteredPoliciesList].sort((a, b) =>
          a[sortItem].toLowerCase() < b[sortItem].toLowerCase() ? 1 : -1
        );
        setFilteredPoliciesList(sortedPolicies);
        setOrder("ASC")
      }
    }
  };

  //This part is related to Filter
  const onFilterChange = (fieldName, selectedFilter) => {
    //console.log(`onFilterChange called`);
    //console.log(`${fieldName} : ${selectedFilter}`);
    setFilterQuery(oldFilterQuery => ({
      ...oldFilterQuery,
      [fieldName]: selectedFilter
    }));

    //useEffect will be triggered which will do the filter 
  }
  useEffect(() => {
    let filteredRows = policiesList;
    Object.keys(filterQuery).forEach(key => {
      //console.log(`${key} : ${filterQuery[key]}`);
      if (filterQuery[key] !== '') {
        filteredRows = filteredRows.filter(item => item[key] === filterQuery[key]);
      }
    });
    setFilteredPoliciesList(filteredRows);
    setFirstIndex(0);
  }, [filterQuery]);

  const onClearFilter = () => {
    window.location.reload();
  }

  //This  part related to Pagination logic
  let pageCount = Math.ceil(filteredPoliciesList.length / selectedRecordsPerPage);
  let lastIndex = firstIndex + selectedRecordsPerPage;
  let tableRows = filteredPoliciesList.slice(firstIndex, lastIndex);
  const handlePageChange = (event) => {
    const newIndex = (event.selected * selectedRecordsPerPage) % filteredPoliciesList.length;
    setFirstIndex(newIndex);
  };
  const changeItemsPerPage = (num) => {
    setIsItemsPerPageOpen(false);
    setSelectedRecordsPerPage(num);
    setFirstIndex(0);
  };

  return (
    <div className="flex-col w-full p-5 bg-anti-flash-white h-full font-inter">
      {!dataLoaded && (
        <LoadingIcon></LoadingIcon>
      )}
      {dataLoaded && (
        <>
          {errorMsg && (
            <div className="flex justify-end max-w-7xl">
              <div className="flex justify-between items-center max-w-96 min-h-14 min-w-72 bg-[#C61818] rounded-xl p-3 mr-10">
                <ErrorMessage errorCode={errorCode} errorMessage={errorMsg} clickOnCancel={cancelErrorMsg}></ErrorMessage>
              </div>
            </div>
          )}
          <div className="flex-col ml-1">
            <div className="flex justify-between mb-5">
              <div className="flex space-x-4">
                <img src={backArrow} alt="" onClick={() => moveToHome()} className="mt-1 cursor-pointer" />
                <div className="flex-col mt-4">
                  <h1 className="font-bold text-lg text-md text-blue-900">{t('policies.requestAPolicy')}</h1>
                  <p onClick={() => moveToHome()} className="font-semibold text-blue-500 text-xs cursor-pointer">
                    {t('commons.home')}
                  </p>
                </div>
              </div>

              {policiesList.length > 0 ?
                <button type="button" className="h-[50px] text-sm font-medium px-7 text-white bg-tory-blue rounded-md">
                  {t('policies.requestPolicyBtn')}
                </button>
                : null
              }
            </div>

            <div className="flex-col justify-center ml-1 h-full">
              {!policiesList === 0
                ?
                <div className="bg-white w-full mt-3 rounded-lg shadow-lg items-center">
                  <div className="flex justify-between py-2 pt-4 text-xs font-medium text-gray-500">
                    <div className="flex sm:gap-x-7 md:gap-x-16 lg:gap-x-36">
                      <h6 className="ml-5">{t('policies.partnerId')}</h6>
                      <h6>{t('policies.partnerType')}</h6>
                      <h6>{t('policies.policyName')}</h6>
                    </div>
                    <div className='flex sm:gap-x-7 md:gap-x-16 lg:gap-x-40  mr-6'>
                      <h6>{t('policies.status')}</h6>
                      <h6>{t('policies.action')}</h6>
                    </div>
                  </div>

                  <hr className="h-px mx-3 bg-gray-200 border-0" />

                  <div className="flex items-center justify-center p-24">
                    <div className="flex-col items-center">
                      <img src={rectangleGrid} alt="" />
                      <button type="button" className="text-white mt-8 ml-16 bg-tory-blue rounded-md text-xs px-5 py-3">
                        {t('policies.requestPolicyBtn')}
                      </button>
                    </div>
                  </div>
                </div>
                :
                <>
                  <div className="bg-white w-full mt-1 rounded-t-xl shadow-lg">
                    <div className="flex w-full p-2">
                      <div className="flex w-full pl-3 justify-start font-bold text-blue-900 text-md" >
                        {t('policies.listOfPolicies') + ' (' + filteredPoliciesList.length + ")"}
                      </div>
                      <div className="w-full flex justify-end relative ">
                        <button onClick={() => setFilter(!filter)} type="button" className={`flex justify-center items-center w-[20%] text-sm py-3  text-blue-700 border border-blue-700 font-semibold rounded-md text-center
                        ${filter ? 'bg-blue-800 text-white' : 'text-blue-700'}`}
                        >
                          {t('policies.filterBtn')}
                          <svg
                            xmlns="http://www.w3.org/2000/svg" className={`${filter ? 'rotate-180 text-white' : null} ml-2`}
                            width="10" height="8" viewBox="0 0 10 8">
                            <path id="Polygon_8"
                              data-name="Polygon 8"
                              d="M3.982,1.628a1.2,1.2,0,0,1,2.035,0L8.853,6.164A1.2,1.2,0,0,1,7.835,8H2.165A1.2,1.2,0,0,1,1.147,6.164Z"
                              transform="translate(10 8) rotate(180)" fill={`${filter ? '#ffff' : '#1447b2'}`} />
                          </svg>
                        </button>
                        {filter && <button onClick={() => onClearFilter()} type="button"
                          className="flex ml-2 justify-center items-center w-[20%] text-sm py-3 border border-blue-700 font-semibold rounded-md text-center bg-blue-800 text-white">
                          Clear Filter
                        </button>}
                      </div>
                    </div>
                    {filter &&
                      <PoliciesFilter
                        filteredPoliciesList={filteredPoliciesList}
                        onFilterChange={onFilterChange}
                      ></PoliciesFilter>}
                    <hr className="h-0.5 mt-3 bg-gray-200 border-0" />
                    <div>
                      <table className="table-auto mx-5 lg:w-[96%]">
                        <thead>
                          <tr>
                            {tableHeaders.map((header, index) => {
                              return (
                                <th key={index} className="py-4 text-sm font-medium text-gray-500 lg:w-[15%]">
                                  <div className="mx-2 flex gap-x-1 items-center">
                                    {t(header.headerNameKey)}
                                    <img
                                      src={sortIcon} className="cursor-pointer"
                                      onClick={() => toggleSortOrder(header.id)} alt=""
                                    />
                                  </div>
                                </th>
                              )
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((partner, index) => {
                            return (
                              <tr key={index} className={`border-y-2 text-xs text-[#191919] font-semibold ${partner.status === "Deactivated" ? "text-gray-400" : "text-[#191919]"}`}>
                                <td className="px-2">{partner.partnerId}</td>
                                <td className="px-2">{partner.partnerType}</td>
                                <td className="px-2">{partner.policyGroup}</td>
                                <td className="px-2">{partner.policyName}</td>
                                <td className="px-2">{formatDate(partner.createDate, 'dateTime')}</td>
                                <td className="">
                                  <div className={`${bgOfStatus(partner.status)}flex w-fit py-1.5 px-2 m-3 text-xs rounded-md`}>
                                    {partner.status}
                                  </div>
                                </td>
                                <td className="text-center">
                                  <div>
                                    <p onClick={() => setViewPolicyId(index)} className="font-semibold mb-0.5 cursor-pointer">...</p>
                                    {
                                      viewPolicyId === index && (
                                        <div onClick={() => showViewPolicyDetails()}
                                          className="absolute bg-white text-xs font-medium rounded-lg shadow-md border">
                                          <p className="px-5 py-2 cursor-pointer">
                                            {t('policies.view')}
                                          </p>
                                        </div>
                                      )
                                    }
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex justify-between bg-white items-center h-9 w-full m-0.5 p-8 rounded-b-md shadow-lg">
                    <div></div>

                    <ReactPaginate
                      breakLabel="..."
                      previousLabel={<svg onClick={perviousPage}
                        xmlns="http://www.w3.org/2000/svg"
                        width="28" height="28" viewBox="0 0 32 32">
                        <g id="Group_58361" data-name="Group 58361" transform="translate(-438.213 -745)">
                          <g id="Rectangle_15" data-name="Rectangle 15" transform="translate(438.213 745)"
                            fill="#fff" stroke={previous ? "#1447b2" : "#bababa"} strokeWidth="1">
                            <rect width="32" height="32" rx="6" stroke="none" />
                            <rect x="0.5" y="0.5" width="31" height="31" rx="5.5" fill="none" />
                          </g>
                          <path id="expand_more_FILL0_wght400_GRAD0_opsz48"
                            d="M5.68,0,0,5.679,1.018,6.7,5.68,2.011l4.662,4.662,1.018-1.018Z"
                            transform="translate(450.214 766.359) rotate(-90)" fill={previous ? "#1447b2" : "#bababa"} />
                        </g>
                      </svg>}
                      nextLabel={<svg onClick={nextPage}
                        xmlns="http://www.w3.org/2000/svg"
                        width="28" height="28" viewBox="0 0 32 32">
                        <g id="Group_58360" data-name="Group 58360" transform="translate(-767.213 -745)">
                          <g id="Rectangle_16" data-name="Rectangle 16" transform="translate(767.213 745)"
                            fill="#fff" stroke={next ? "#1447b2" : "#bababa"} strokeWidth="1">
                            <rect width="32" height="32" rx="6" stroke="none" />
                            <rect x="0.5" y="0.5" width="31" height="31" rx="5.5" fill="none" />
                          </g>
                          <path id="expand_more_FILL0_wght400_GRAD0_opsz48"
                            d="M17.68,23.3,12,17.618,13.018,16.6l4.662,4.686,4.662-4.662,1.018,1.018Z"
                            transform="translate(763.613 778.68) rotate(-90)" fill={next ? "#1447b2" : "#bababa"} />
                        </g>
                      </svg>}
                      onPageChange={handlePageChange}
                      pageRangeDisplayed={3}
                      pageCount={pageCount}
                      renderOnZeroPageCount={null}
                      containerClassName="flex gap-x-4 mx-4 items-center"
                      pageLinkClassName={`text-blue-700 font-semibold text-xs`}
                      activeLinkClassName='text-gray-100 bg-blue-700 py-[18%] px-3 rounded-md'
                      breakClassName='text-blue-700 text-md'
                    />

                    <div className="flex items-center gap-x-3">
                      <h6 className="text-gray-500 text-xs">{t('policies.itemsPerPage')}</h6>
                      <div>
                        <div className="cursor-pointer flex justify-between w-10 h-6 items-center 
                        text-xs border-2 px-1 rounded-md border-indigo-400 text-indigo-600 font-medium"
                          onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}>
                          <p>
                            {selectedRecordsPerPage}
                          </p>
                          <svg className={`${isItemsPerPageOpen ? "rotate-180" : null}`}
                            xmlns="http://www.w3.org/2000/svg"
                            width="10.359" height="5.697" viewBox="0 0 11.359 6.697">
                            <path id="expand_more_FILL0_wght400_GRAD0_opsz48"
                              d="M17.68,23.3,12,17.618,13.018,16.6l4.662,4.686,4.662-4.662,1.018,1.018Z"
                              transform="translate(-12 -16.6)" fill="#1447b2" />
                          </svg>
                        </div>
                        {isItemsPerPageOpen && (
                          <div className="absolute bg-white text-xs text-indigo-600 font-medium rounded-b-lg shadow-md">
                            {itemsPerPageOptions.map((num, i) => {
                              return (
                                <p key={i} onClick={() => changeItemsPerPage(num)}
                                  className="px-3 py-2 cursor-pointer hover:bg-gray-200">
                                  {num}
                                </p>
                              )
                            })
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              }
            </div>
          </div>
          <Footer></Footer>
        </>
      )}

    </div>
  )

  function perviousPage() {
    setPrevious(true);                                  //   Functions related to pagination 
    setNext(false);                                      //  to handle previous & next
  }
  function nextPage() {
    setNext(true);
    setPrevious(false);
  }
}

export default Policies;