import React, { useRef, useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { connect } from "react-redux";

import PicturesWall from "../../components/PicturesWall ";
import LazyOptions from "../../components/LazyOptions";
import { addOrUpdateGoodsApi, getGoodsDetailApi, cancelReq } from "../../api";
// import { AncestorCategoriesContext } from "../../components/Reducer";
import { getAncestorCategoriesFromGoodsDetail } from "../../redux/actions";

import "./GoodsDetail.less";

function GoodsDetail(props) {
  const [form] = Form.useForm();
  //图片上传组件
  const picturesWallRef = useRef(null);
  //级联选择下拉框
  const lazyOptionsRef = useRef(null);

  const { getAncestorCategoriesFromGoodsDetail } = props;

  const layout = {
    labelCol: {
      span: 4,
    },
    wrapperCol: {
      span: 12,
    },
  };
  const tailLayout = {
    wrapperCol: {
      offset: 4,
      span: 12,
    },
  };

  const [goodsDetail, setGoodsDetail] = useState(null);
  // //用于修改祖先链的dispatch方法
  // const { ancestorCategoriesDispatch } = useContext(
  //   AncestorCategoriesContext
  // );
  useEffect(() => {
    const _id = props.match.params.id;
    //如果动态路由参数id存在，那么就是修改商品信息。否则就是添加商品。
    if (_id) {
      getGoodsDetailApi(_id).then((result) => {
        const { code, msg, data } = result;
        if (code === 0) {
          setGoodsDetail({
            ...data.goodsDetail,
            ancestorCategories: data.ancestorCategories,
            ancestorForest: data.ancestorForest,
          });
          // ancestorCategoriesDispatch({
          //   type: "getAncestorCategoriesFromGoodsDetail",
          //   ancestorCategories: data.ancestorCategories,
          // });
          getAncestorCategoriesFromGoodsDetail(
            data.ancestorCategories
          );
        } else {
          message.error(msg);
        }
      });
    }
    return cancelReq;
  }, [props.match.params.id, getAncestorCategoriesFromGoodsDetail]);

  //重置表单
  const onReset = () => {
    form.setFieldsValue({
      goodsName: "",
      goodsDescription: "",
      marketPrice: undefined,
      nowPrice: undefined,
      goodsAmount: undefined,
    });
    lazyOptionsRef.current.resetState();
    picturesWallRef.current.resetState();
  };

  //提交表单时调用此方法
  const onFinish = async (values) => {
    values.marketPrice *= 1;
    values.nowPrice *= 1;
    let goods = {
      ...values,
      categoryId: lazyOptionsRef.current.provideAncestorCategories().pop(),
      goodsImages: picturesWallRef.current.getImgs(),
    };
    if (props.match.params.id) {
      goods._id = props.match.params.id;
    }
    const result = await addOrUpdateGoodsApi(goods);
    if (result.code === 0) {
      message.success(result.msg);
      onReset();
    } else {
      message.error(result.msg);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error("保存商品失败");
  };

  return goodsDetail || !props.match.params.id ? (
    <Form
      {...layout}
      name="basic"
      form={form}
      initialValues={
        goodsDetail
          ? {
              goodsName: goodsDetail.goodsName,
              goodsDescription: goodsDetail.goodsDescription,
              marketPrice: goodsDetail.marketPrice,
              nowPrice: goodsDetail.nowPrice,
              goodsAmount: goodsDetail.goodsAmount,
            }
          : {}
      }
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label="商品分类"
        rules={[{ required: true, message: "请选择商品分类" }]}
      >
        <LazyOptions
          ref={lazyOptionsRef}
          ancestorCategories={
            goodsDetail ? goodsDetail.ancestorCategories : null
          }
          ancestorForest={
            goodsDetail ? goodsDetail.ancestorForest : null
          }
        />
      </Form.Item>
      <Form.Item
        label="商品名称 "
        name="goodsName"
        rules={[{ required: true, message: "请选请输入商品名称" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="商品描述" name="goodsDescription">
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        label="原价"
        name="marketPrice"
        rules={[{ required: true, message: "请选请输入商品原价" }]}
      >
        <Input type="number" addonAfter="元" />
      </Form.Item>
      <Form.Item
        label="现价"
        name="nowPrice"
        rules={[{ required: true, message: "请选请输入商品现价" }]}
      >
        <Input type="number" addonAfter="元" />
      </Form.Item>
      <Form.Item
        label="商品数量"
        name="goodsAmount"
        rules={[{ required: true, message: "请输入此商品的数量" }]}
      >
        <Input type="number" />
      </Form.Item>
      <Form.Item label="上传图片">
        <PicturesWall
          ref={picturesWallRef}
          images={goodsDetail ? goodsDetail.goodsImages : []}
        />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
        <Button htmlType="button" onClick={onReset}>
          清空
        </Button>
      </Form.Item>
    </Form>
  ) : (
    "Loading..."
  );
}

// export default GoodsDetail;
export default connect((state) => ({}), {
  getAncestorCategoriesFromGoodsDetail,
})(GoodsDetail);
