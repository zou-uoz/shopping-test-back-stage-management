import React, { useState, useEffect, useRef } from "react";
import { Input, message, Modal, Row, Col, Space, Typography } from "antd";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { addOrUpdateCategoryApi, deleteCategoryApi } from "../api";
import PicturesWall from "./PicturesWall ";
import { clickOneOfAncestorCategories } from "../redux/actions";
// import { AncestorCategoriesContext } from "./Reducer";

const { Link } = Typography;

const CategoryManage = (props) => {
  //图片上传组件
  const picturesWallAddRef = useRef(null);
  const picturesWallUpdateRef = useRef(null);

  //模态框
  const [modalState, setModalState] = useState({
    ModalTitle: "",
    visible: false,
    confirmLoading: false,
  });

  // //当前祖先链，以及改变祖先链的dispatch方法
  // const {
  //   ancestorCategories,
  //   ancestorCategoriesDispatch,
  // } = useContext(AncestorCategoriesContext);
  const { ancestorCategories, clickOneOfAncestorCategories } = props;
  //祖先链中的最后一个分类是当前分类
  const currentCategory =
    ancestorCategories[ancestorCategories.length - 1];
  //当前分类的名字
  const [categoryName, setCategoryName] = useState(
    currentCategory.categoryName
  );

  //当前分类变化时，取得最新的当前分类的名字
  useEffect(() => {
    setCategoryName(currentCategory.categoryName);
  }, [currentCategory.categoryName]);

  //显示模态框
  const showModal = (operationType) => {
    setModalState({
      ModalTitle: operationType,
      visible: true,
      confirmLoading: false,
    });
    if (operationType === "添加分类") {
      setCategoryName("");
    }
  };

  //点击确定按钮时
  const handleOk = async () => {
    setModalState((modalState) => ({
      ...modalState,
      confirmLoading: true,
    }));
    let result;
    switch (modalState.ModalTitle) {
      case "修改分类":
        const categoryAfterUpdate = {
          ...currentCategory,
          categoryName,
        };
        if (
          picturesWallUpdateRef.current &&
          picturesWallUpdateRef.current.getImgs().length
        ) {
          //选择图片上传组件的第一张图片作为新分类的图片
          categoryAfterUpdate.categoryImage = picturesWallUpdateRef.current.getImgs()[0];
        } else {
          //图片上传组件没有图片时，删除新分类的图片
          delete categoryAfterUpdate.categoryImage;
        }
        result = await addOrUpdateCategoryApi(categoryAfterUpdate);
        break;
      case "删除分类":
        // if (currentCategory.categoryImage) {
        //   //先删除当前分类的图片
        //   deleteImageResult = await deleteUploadImageApi(
        //     currentCategory.categoryImage
        //   );
        // }
        //删除当前分类
        result = await deleteCategoryApi(currentCategory._id);
        // if (deleteImageResult && deleteImageResult.code !== 0) {
        //   result = deleteImageResult;
        // }
        break;
      case "添加分类":
        //为当前分类添加一个子分类对象
        const newCategory = {
          parentId: currentCategory._id,
          categoryName,
        };
        if (
          picturesWallAddRef.current &&
          picturesWallAddRef.current.getImgs().length
        ) {
          newCategory.categoryImage = picturesWallAddRef.current.getImgs()[0];
        }
        result = await addOrUpdateCategoryApi(newCategory);
        break;
      default:
        throw new Error("操作类型错误");
    }
    const { code, msg } = result;
    if (code === 0) {
      message.success(msg);
    } else {
      message.error(msg);
    }
    setModalState({
      ModalTitle: "",
      visible: false,
      confirmLoading: false,
    });
    // //修改状态重新回到“一级分类列表”
    // ancestorCategoriesDispatch({
    //   type: "clickOneOfAncestorCategories",
    //   category: ancestorCategories[0],
    // });
    clickOneOfAncestorCategories(ancestorCategories[0]);
    // props.history.push("/admin/goodsManage/category");
  };

  //如果点击了取消按钮
  const handleCancel = () => {
    setModalState({
      ModalTitle: "",
      visible: false,
      confirmLoading: false,
    });
    setCategoryName(currentCategory.categoryName);
  };

  const { visible, confirmLoading, ModalTitle } = modalState;

  return (
    <div style={{ fontSize: 16 }}>
      <Space size={50}>
        {/* 三级分类列表下不能再添加子分类了 */}
        {ancestorCategories.length < 4 ? (
          <Link onClick={() => showModal("添加分类")}>添加分类</Link>
        ) : null}
        {/* 不能删除和修改根分类节点 */}
        {ancestorCategories.length > 1 ? (
          <>
            <Link onClick={() => showModal("修改分类")}>修改分类</Link>
            <Link onClick={() => showModal("删除分类")}>删除分类</Link>
          </>
        ) : null}
      </Space>
      <Modal
        title={ModalTitle}
        visible={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        okText="确认"
        cancelText="取消"
      >
        {/* 根据ModalTitle显示哪一个模态框 */}
        {ModalTitle === "修改分类" ? (
          <>
            <Row justify="space-around" align="middle" gutter={[10, 30]}>
              <Col span={4}>分类名称：</Col>
              <Col span={20}>
                <Input
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                  }}
                />
              </Col>
            </Row>
            {currentCategory.categoryImage ? (
              <Row gutter={[10, 30]}>
                <Col offset={4}>
                  <PicturesWall
                    ref={picturesWallUpdateRef}
                    images={[currentCategory.categoryImage]}
                    maxNumber={1}
                  />
                </Col>
              </Row>
            ) : null}
          </>
        ) : ModalTitle === "删除分类" ? (
          <Row justify="space-around" align="middle" gutter={[10, 30]}>
            <Col span={6}>确认删除分类:</Col>
            <Col span={16}>{currentCategory.categoryName}？</Col>
          </Row>
        ) : (
          <>
            <Row justify="space-around" align="middle" gutter={[10, 30]}>
              <Col span={4}>上级分类：</Col>
              <Col span={20}>
                {ancestorCategories.map(
                  (category) =>
                    " / " + category.categoryName
                )}
              </Col>
            </Row>
            <Row justify="space-around" align="middle" gutter={[10, 30]}>
              <Col span={4}>分类名称：</Col>
              <Col span={20}>
                <Input
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                  }}
                />
              </Col>
            </Row>
            {ancestorCategories.length === 3 ? (
              <Row gutter={[10, 30]}>
                <Col offset={4}>
                  <PicturesWall
                    ref={picturesWallAddRef}
                    maxNumber={1}
                    images={[]}
                  />
                </Col>
              </Row>
            ) : null}
          </>
        )}
      </Modal>
    </div>
  );
};

// export default withRouter(CategoryManage);
export default withRouter(
  connect(
    (state) => ({
      ancestorCategories: state.ancestorCategories,
    }),
    { clickOneOfAncestorCategories }
  )(CategoryManage)
);
